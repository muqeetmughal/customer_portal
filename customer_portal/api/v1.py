import frappe
from frappe import _
from frappe.utils import getdate, add_months, today
from datetime import date



@frappe.whitelist()
def get_customer_dashboard_data():

    current_user = frappe.session.user  # get current logged-in user

    customer_name = frappe.db.get_value(
        "Portal User", 
        {"user": current_user}, 
        "parent" 
    )

    if not customer_name:
        # Return empty metrics if no Customer is linked to the logged-in user
        return {
            "total_sales": {"amount": 0, "change_percentage": 0, "change_text": "vs last month"},
            "outstanding": {"amount": 0, "change_percentage": 0, "change_text": "vs last month"},
            "paid_to_date": {"amount": 0, "change_percentage": 0, "change_text": "vs last month"},
            "ledger_balance": {"amount": 0}
        }

    customer = customer_name

    # -------------------- Total Sales --------------------
    total_sales = frappe.db.sql("""
        SELECT
            SUM(CASE 
                    WHEN MONTH(posting_date) = MONTH(CURDATE())
                     AND YEAR(posting_date) = YEAR(CURDATE())
                    THEN grand_total ELSE 0 END) AS current_month_sales,
            SUM(CASE
                    WHEN MONTH(posting_date) = MONTH(CURDATE() - INTERVAL 1 MONTH)
                     AND YEAR(posting_date) = YEAR(CURDATE() - INTERVAL 1 MONTH)
                    THEN grand_total ELSE 0 END) AS last_month_sales
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND customer = %s;
    """, (customer,), as_dict=True)[0]

    current_month_sales = float(total_sales.current_month_sales or 0)
    last_month_sales = float(total_sales.last_month_sales or 0)
    total_sales_change = ((current_month_sales - last_month_sales) / last_month_sales * 100) if last_month_sales else 0.0
    total_sales_change = max(0, min(total_sales_change, 100)) 

    # -------------------- Outstanding --------------------
    outstanding = frappe.db.sql("""
        SELECT
            SUM(CASE 
                    WHEN MONTH(posting_date) = MONTH(CURDATE())
                     AND YEAR(posting_date) = YEAR(CURDATE())
                    THEN outstanding_amount ELSE 0 END) AS current_month_outstanding,
            SUM(CASE
                    WHEN MONTH(posting_date) = MONTH(CURDATE() - INTERVAL 1 MONTH)
                     AND YEAR(posting_date) = YEAR(CURDATE() - INTERVAL 1 MONTH)
                    THEN outstanding_amount ELSE 0 END) AS last_month_outstanding
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND outstanding_amount > 0 AND customer = %s;
    """, (customer,), as_dict=True)[0]

    current_month_outstanding = float(outstanding.current_month_outstanding or 0)
    last_month_outstanding = float(outstanding.last_month_outstanding or 0)
    outstanding_change = ((current_month_outstanding - last_month_outstanding) / last_month_outstanding * 100) if last_month_outstanding else 0.0
    outstanding_change = max(0, min(outstanding_change, 100)) 

    # -------------------- Paid to Date --------------------
    paid_to_date = frappe.db.sql("""
        SELECT
            SUM(CASE 
                    WHEN MONTH(posting_date) = MONTH(CURDATE())
                     AND YEAR(posting_date) = YEAR(CURDATE())
                    THEN base_grand_total - outstanding_amount ELSE 0 END) AS current_month_received,
            SUM(CASE 
                    WHEN MONTH(posting_date) = MONTH(CURDATE() - INTERVAL 1 MONTH)
                     AND YEAR(posting_date) = YEAR(CURDATE() - INTERVAL 1 MONTH)
                    THEN base_grand_total - outstanding_amount ELSE 0 END) AS last_month_received
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND customer = %s;
    """, (customer,), as_dict=True)[0]

    current_month_received = float(paid_to_date.current_month_received or 0)
    last_month_received = float(paid_to_date.last_month_received or 0)
    paid_to_date_change = ((current_month_received - last_month_received) / last_month_received * 100) if last_month_received else 0.0
    paid_to_date_change = max(0, min(paid_to_date_change, 100)) 

    # -------------------- Ledger Balance --------------------
    ledger_balance = frappe.db.sql("""
        SELECT SUM(grand_total - outstanding_amount) AS ledger_balance
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND customer = %s;
    """, (customer,), as_dict=True)[0]

    ledger_balance_amount = float(ledger_balance.ledger_balance or 0)

    return {
        "total_sales": {
            "amount": current_month_sales,
            "change_percentage": round(total_sales_change, 2),
            "change_text": "vs last month"
        },
        "outstanding": {
            "amount": current_month_outstanding,
            "change_percentage": round(outstanding_change, 2),
            "change_text": "vs last month"
        },
        "paid_to_date": {
            "amount": current_month_received,
            "change_percentage": round(paid_to_date_change, 2),
            "change_text": "vs last month"
        },
        "ledger_balance": {
            "amount": ledger_balance_amount
        }
    }



@frappe.whitelist() #sales velocity monthly
def get_sales_velocity_monthly(from_date=None, to_date=None):
    if not to_date:
        to_date = today()

    if not from_date:
        from_date = add_months(to_date, -12)

    from_date = getdate(from_date)
    to_date = getdate(to_date)

    data = frappe.db.sql("""
        SELECT
            DATE_FORMAT(posting_date, '%%b') AS month_name,
            SUM(base_grand_total) AS total_sales,
            COUNT(name) AS invoice_count,
            MONTH(posting_date) AS month_number
        FROM `tabSales Invoice`
        WHERE
            docstatus = 1
            AND posting_date BETWEEN %s AND %s
        GROUP BY month_number
        ORDER BY month_number ASC
    """, (from_date, to_date), as_dict=True)

    return {
        "labels": [d["month_name"] for d in data],
        "orders": [d["invoice_count"] for d in data],
        "sales": [float(d["total_sales"] or 0) for d in data],
        "raw": data
    }


@frappe.whitelist()
def get_sales_invoice_status_count(): # Collections Overview pie chart 
    result = frappe.db.sql("""
        SELECT 
            status,
            COUNT(*) AS count
        FROM `tabSales Invoice`
        WHERE status IN ('Draft', 'Overdue', 'Paid')
        GROUP BY status
    """, as_dict=True)

    counts = {"Draft": 0, "Overdue": 0, "Paid": 0}
    for row in result:
        counts[row["status"]] = row["count"]

    return counts


@frappe.whitelist() #top selling items
def get_top_selling_items(limit=10):
    data = frappe.db.sql("""
        SELECT
            sii.item_name AS name,
            COUNT(sii.name) AS sales_count
        FROM `tabSales Invoice Item` AS sii
        JOIN `tabSales Invoice` AS si ON si.name = sii.parent
        WHERE
            si.docstatus = 1
        GROUP BY sii.item_name
        ORDER BY sales_count DESC
        LIMIT %s
    """, (limit,), as_dict=True)

    return data

@frappe.whitelist()
def get_recent_activities(): # dashboard recent activities 

    activities = []
    
    doctypes = {
        "Sales Invoice": {"label": "Invoice", "icon": "CreditCard"},
        "Sales Order": {"label": "Order", "icon": "ShoppingCart"},
        "Quotation": {"label": "Quote", "icon": "FileText"},
        "Delivery Note": {"label": "Delivery", "icon": "Truck"}
    }
    
    for doctype, meta in doctypes.items():
        records = frappe.get_all(
            doctype,
            fields=["name", "status", "grand_total", "modified", "creation"],
            order_by="modified desc",
            limit=5
        )
        
        for record in records:
            activities.append({
                "id": f"{doctype}-{record.name}",
                "type": meta["label"],
                "desc": f"{meta['label']} #{record.name}",
                "date": record.modified,
                "status": record.status,
                "amount": record.grand_total,
                "timestamp": record.modified
            })
            
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return activities[:10]


@frappe.whitelist()
def get_sales_invoice_data(): #sales invoice data 
    current_user = frappe.session.user

    customer_name = frappe.db.get_value(
        "Portal User", 
        {"user": current_user}, 
        "parent" 
    )

    if not customer_name:
        return []

    data = frappe.db.sql("""
        SELECT
            name,
            posting_date,
            due_date,
            grand_total AS total,
            status
        FROM `tabSales Invoice`
        WHERE docstatus = 1 AND customer = %s
        ORDER BY posting_date DESC
    """, (customer_name,), as_dict=True)

    return data



@frappe.whitelist()
def get_sales_order_data(): #sales order data 

    current_user = frappe.session.user
    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )

    if not customer_name:
        return []

    data = frappe.db.sql("""
        SELECT
            name,
            transaction_date,
            grand_total,
            status
        FROM `tabSales Order`
        WHERE customer = %s
        ORDER BY transaction_date DESC
    """, (customer_name,), as_dict=True)

    return data


@frappe.whitelist()
def get_quotation_data(): #quotation data 

    current_user = frappe.session.user
    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )

    if not customer_name:
        return []

    quotations = frappe.db.sql("""
        SELECT
            name,
            creation AS created_on,
            valid_till,
            grand_total,
            status
        FROM `tabQuotation`
        WHERE docstatus = 1 AND party_name = %s
        ORDER BY creation DESC
    """, (customer_name,), as_dict=True)

    return quotations



@frappe.whitelist()
def get_delivery_note_data(): #deliveru note data 
    current_user = frappe.session.user
    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )

    if not customer_name:
        return []

    delivery_notes = frappe.db.sql("""
        SELECT
            dn.name AS delivery_note,
            dni.against_sales_order AS sales_order,
            dn.posting_date,
            dn.status
        FROM `tabDelivery Note` dn
        JOIN `tabDelivery Note Item` dni
            ON dn.name = dni.parent
        WHERE dn.docstatus = 1 AND dn.customer = %s
        ORDER BY dn.posting_date DESC
    """, (customer_name,), as_dict=True)

    return delivery_notes


@frappe.whitelist()
def get_product_catalog(): #items data for inventory page
    data = frappe.db.sql("""
        SELECT
            i.name AS id,
            i.item_name AS name,
            IFNULL(ip.price_list_rate, 0) AS price,
            IFNULL(SUM(b.actual_qty), 0) AS stock,
            i.item_group AS category,
            MAX(f.file_url) AS image

        FROM `tabItem` i

        LEFT JOIN `tabItem Price` ip
            ON ip.item_code = i.name
            AND ip.selling = 1
            AND ip.price_list = 'Standard Selling'

        LEFT JOIN `tabBin` b
            ON b.item_code = i.name

        LEFT JOIN `tabFile` f
            ON f.attached_to_doctype = 'Item'
            AND f.attached_to_name = i.name
            AND f.is_private = 0

        WHERE i.disabled = 0
          AND i.is_stock_item = 1

        GROUP BY i.name
        ORDER BY i.item_name ASC
    """, as_dict=True)

    return data




@frappe.whitelist()
def get_customer_ledger_data(): #customer ledger data

    current_user = frappe.session.user
    
    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )
    
    if not customer_name:
        return []

    query = """
    WITH RawData AS (
        SELECT
            gle.posting_date,
            gle.voucher_type,
            gle.voucher_no,
            gle.debit,
            gle.credit,
            gle.creation,
            gle.name
        FROM `tabGL Entry` gle
        JOIN `tabAccount` acc ON acc.name = gle.account
        WHERE
            acc.account_type = 'Receivable'
            AND gle.party_type = 'Customer'
            AND gle.party = %s
            AND gle.is_cancelled = 0
    ),
    CalculatedLedger AS (
        -- Calculate the running balance
        SELECT
            posting_date,
            voucher_type,
            voucher_no,
            debit,
            credit,
            SUM(debit - credit) OVER (ORDER BY posting_date, creation, name) AS balance,
            2 AS sort_order -- Transactions have sort order 2
        FROM RawData
    )
    -- Combine everything into the final report
    SELECT * FROM (
        -- 1. Opening Balance Row (Always 0 for full history, or calculated if date filtered)
        SELECT 
            NULL AS posting_date, 
            'Opening Balance' AS voucher_type, 
            NULL AS voucher_no, 
            0.0 AS debit, 
            0.0 AS credit, 
            0.0 AS balance, 
            1 AS sort_order
        
        UNION ALL
        
        -- 2. Individual Transactions
        SELECT 
            posting_date, 
            voucher_type, 
            voucher_no, 
            debit, 
            credit, 
            balance, 
            sort_order 
        FROM CalculatedLedger
        
        UNION ALL
        
        -- 3. Total Debit/Credit Row
        SELECT 
            NULL AS posting_date, 
            'Total' AS voucher_type, 
            NULL AS voucher_no, 
            SUM(debit) AS debit, 
            SUM(credit) AS credit, 
            NULL AS balance, 
            3 AS sort_order 
        FROM RawData
        
        UNION ALL
        
        -- 4. Closing Balance Row
        SELECT 
            NULL AS posting_date, 
            'Closing (Total)' AS voucher_type, 
            NULL AS voucher_no, 
            NULL AS debit, 
            NULL AS credit, 
            SUM(debit - credit) AS balance, 
            4 AS sort_order 
        FROM RawData
    ) AS FinalReport
    ORDER BY sort_order, posting_date, balance;
    """

    data = frappe.db.sql(query, (customer_name,), as_dict=True)
    
    formatted_data = []
    for idx, row in enumerate(data):
        formatted_data.append({
            "id": str(idx + 1),
            "date": row.get("posting_date").strftime("%b %d, %Y") if row.get("posting_date") else "-",
            "type": row.get("voucher_type"),
            "ref": row.get("voucher_no") or "-",
            "debit": f"{row.get('debit', 0):,.2f}" if row.get('debit') is not None else "0.00",
            "credit": f"{row.get('credit', 0):,.2f}" if row.get('credit') is not None else "0.00",
            "balance": f"{row.get('balance', 0):,.2f}" if row.get('balance') is not None else "-"
        })
    
    return formatted_data



@frappe.whitelist()
def create_sales_order(cart=None): #create sales order from cart data

    if isinstance(cart, str):
        cart = frappe.parse_json(cart)

    if not cart:
        frappe.throw("Cart is empty")

    current_user = frappe.session.user

    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )

    if not customer_name:
        frappe.throw("No Customer linked with this user")

    today = date.today()

    try:
        items = []

        for row in cart:
            items.append({
                "item_code": row.get("id"),
                "qty": row.get("quantity"),
                "delivery_date": today,
            })

        sales_order = frappe.get_doc({
            "doctype": "Sales Order",
            "customer": customer_name,
            "transaction_date": today,
            "delivery_date": today,
            "order_type": "Sales",
            "currency": "PKR",
            "selling_price_list": "Standard Selling",
            "items": items
        })

        sales_order.insert(ignore_permissions=True)
        frappe.db.commit()

        return {
            "status": "success",
            "sales_order": sales_order.name
        }

    except Exception:
        frappe.log_error(frappe.get_traceback(), "Create Sales Order Error")
        return {
            "status": "error",
            "message": "Failed to create Sales Order"
        }


@frappe.whitelist()
def validate_customer_access(): #validate currnet logedin customer 

    if frappe.session.user == "Guest":
        return {
            "is_customer": False,
            "customer": None
        }

    current_user = frappe.session.user

    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )

    if not customer_name:
        return {
            "is_customer": False,
            "customer": None
        }

    return {
        "is_customer": True,
        "customer": customer_name
    }
