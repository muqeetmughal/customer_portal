import frappe
from frappe import _
from frappe.utils import getdate, add_months, today, get_first_day, get_last_day, nowdate, flt
from datetime import date

@frappe.whitelist()
def get_dashboard_data():

    current_user = frappe.session.user
    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )
    customer = customer_name

    # Get the currency symbol for the customer
    currency = frappe.db.get_value("Customer", customer, "default_currency") or frappe.db.get_default("currency")
    currency_symbol = frappe.db.get_value("Currency", currency, "symbol") or "$"

    today = getdate(nowdate())    # date Ranges
    current_month_start = get_first_day(today)
    current_month_end = get_last_day(today)
    last_month_date = add_months(today, -1)
    last_month_start = get_first_day(last_month_date)
    last_month_end = get_last_day(last_month_date) 

    all_sales_invoices = frappe.get_all(
        "Sales Invoice",
        filters={
            "docstatus": 1,
            "customer": customer,
            "posting_date": ["between", [last_month_start, current_month_end]]
        },
        fields=["name", "posting_date", "grand_total", "outstanding_amount", "base_grand_total"]
    )

    current_month_sales = 0.0
    last_month_sales = 0.0
    current_month_outstanding = 0.0
    last_month_outstanding = 0.0
    current_month_received = 0.0
    last_month_received = 0.0
    ledger_balance_amount = 0.0

    for inv in all_sales_invoices:
        inv_date = getdate(inv.posting_date)
        grand_total = flt(inv.grand_total)
        outstanding = flt(inv.outstanding_amount)
        received = flt(inv.base_grand_total) - outstanding

        if current_month_start <= inv_date <= current_month_end:
            current_month_sales += grand_total
            current_month_outstanding += outstanding
            current_month_received += received
        elif last_month_start <= inv_date <= last_month_end:
            last_month_sales += grand_total
            last_month_outstanding += outstanding
            last_month_received += received

        ledger_balance_amount += received

    def percent_change(current, previous):
        if previous == 0 and current > 0:
            return 100.0
        if previous:
            return round(max(-100, min((current - previous) / previous * 100, 100)), 2)
        return 0.0

    customer_summary = {
        "total_sales": {
            "amount": current_month_sales,
            "change_percentage": percent_change(current_month_sales, last_month_sales),
            "change_text": "vs last month"
        },
        "outstanding": {
            "amount": current_month_outstanding
        },
        "paid_to_date": {
            "amount": current_month_received,
            "change_percentage": percent_change(current_month_received, last_month_received),
            "change_text": "vs last month"
        },
        "ledger_balance": {"amount": ledger_balance_amount}
    }

    activities = [] # recent activities 
    doctypes = {
        "Sales Invoice": {"label": "Invoice", "icon": "CreditCard"},
        "Sales Order": {"label": "Order", "icon": "ShoppingCart"},
        "Quotation": {"label": "Quote", "icon": "FileText"},
        "Delivery Note": {"label": "Delivery", "icon": "Truck"}
    }

    for dt, meta in doctypes.items():
        records = frappe.get_all(
            dt,
            fields=["name", "status", "grand_total", "modified"],
            order_by="modified desc",
            limit=5
        )
        for rec in records:
            activities.append({
                "desc": f"{meta['label']} #{rec.name}",
                "date": rec.modified,
                "status": rec.get("status"),
                "amount": rec.get("grand_total"),
                "timestamp": rec.modified
            })
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    recent_activities = activities[:10]

    # hot items current vs previous month 
    curr_sales = frappe.db.sql(f"""
        SELECT
            sii.item_code,
            SUM(sii.qty) AS sales_count,
            SUM(sii.qty * sii.rate) AS revenue
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON sii.parent = si.name
        WHERE si.docstatus = 1
        #   AND si.customer = %s
          AND MONTH(si.posting_date) = MONTH(CURDATE())
          AND YEAR(si.posting_date) = YEAR(CURDATE())
        GROUP BY sii.item_code
    """, customer, as_dict=1)

    prev_sales = frappe.db.sql(f"""
        SELECT
            sii.item_code,
            SUM(sii.qty) AS sales_count,
            SUM(sii.qty * sii.rate) AS revenue
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON sii.parent = si.name
        WHERE si.docstatus = 1
          AND si.customer = %s
          AND MONTH(si.posting_date) = MONTH(CURDATE() - INTERVAL 1 MONTH)
          AND YEAR(si.posting_date) = YEAR(CURDATE() - INTERVAL 1 MONTH)
        GROUP BY sii.item_code
    """, customer, as_dict=1)

    prev_dict = {item['item_code']: item for item in prev_sales}
    hot_items = []

    for item in curr_sales:
        prev = prev_dict.get(item['item_code'], {'sales_count': 0, 'revenue': 0})
        sales_count = flt(item['sales_count'])
        prev_sales_count = flt(prev['sales_count'])
        revenue = flt(item['revenue'])
        prev_revenue = flt(prev['revenue'])

        growth = round((sales_count - prev_sales_count) / prev_sales_count * 100) if prev_sales_count else 100
        growth = max(1, min(growth, 100))

        hot_items.append({
            "name": frappe.get_value("Item", item['item_code'], "item_name"),
            "sales": int(sales_count),
            "revenue": f"{currency_symbol}{revenue:,.0f}",
            "growth": f"+{growth}%" if sales_count >= prev_sales_count else f"-{growth}%"
        })

    hot_items.sort(key=lambda x: x['sales'], reverse=True)
    hot_items = hot_items[:10]

    return {
        "customer_summary": customer_summary,
        "recent_activities": recent_activities,
        "hot_items": hot_items,
        "currency_symbol": currency_symbol
    }





@frappe.whitelist()
def get_dashboard_analytics(from_date=None, to_date=None, limit=10):

    if not to_date:                                                    # sales velovity
        to_date = today()

    if not from_date:
        from_date = add_months(to_date, -12)

    from_date = getdate(from_date)
    to_date = getdate(to_date)

    sales_velocity = frappe.get_all(
        "Sales Invoice",
        filters={
            "docstatus": 1,
            "posting_date": ["between", [from_date, to_date]]
        },
        fields=[
            "DATE_FORMAT(posting_date, '%b') AS month_name",
            "SUM(base_grand_total) AS total_sales",
            "COUNT(name) AS invoice_count",
            "MONTH(posting_date) AS month_number"
        ],
        group_by="month_number",
        order_by="month_number ASC"
    )

    valid_invoices = frappe.get_all(                         # top selling items 
        "Sales Invoice",
        filters={"docstatus": 1},
        fields=["name"]
    )

    valid_invoice_names = [d.name for d in valid_invoices]

    top_items = frappe.get_all(
        "Sales Invoice Item",
        filters={
            "parent": ["in", valid_invoice_names]
        },
        fields=[
            "item_name as name",
            "count(name) as sales_count"
        ],
        group_by="item_name",
        order_by="sales_count desc",
        limit_page_length=limit
    )

    status_result = frappe.get_all(                          # sales invoice status 
        "Sales Invoice",
        filters={
            "status": ["in", ["Draft", "Overdue", "Paid"]]
        },
        fields=["status", "count(name) as count"],
        group_by="status"
    )

    invoice_status = {"Draft": 0, "Overdue": 0, "Paid": 0}
    for row in status_result:
        invoice_status[row["status"]] = row["count"]
                                                            # delivery descrivution 
    delivery_distribution_raw = frappe.db.sql("""            
        SELECT
            it.item_group AS name,
            SUM(dni.qty) AS total_qty
        FROM
            `tabDelivery Note Item` dni
        JOIN
            `tabDelivery Note` dn
                ON dn.name = dni.parent
        JOIN
            `tabItem` it
                ON it.name = dni.item_code
        WHERE
            dn.docstatus = 1
        GROUP BY
            it.item_group
        ORDER BY
            total_qty DESC
        LIMIT 10
    """, as_dict=True)

    delivery_distribution = [
        {
            "name": row["name"],
            "value": float(row["total_qty"] or 0)
        }
        for row in delivery_distribution_raw
    ]

    return {                 # final return data for dashboard analytics
        "sales_velocity": {
            "labels": [d["month_name"] for d in sales_velocity],
            "orders": [d["invoice_count"] for d in sales_velocity],
            "sales": [float(d["total_sales"] or 0) for d in sales_velocity],
        },
        "top_items": top_items,
        "invoice_status": invoice_status,
        "delivery_distribution": delivery_distribution
    }

@frappe.whitelist()
def get_sales_invoice_data():  # sales invoice data with all fields
    current_user = frappe.session.user

    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )

    if not customer_name:
        return []

    data = frappe.get_all(
        "Sales Invoice",
        filters={
            "docstatus": 1,
            "customer": customer_name
        },
        fields=["*"],
        order_by="posting_date desc"
    )

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


    data = frappe.db.get_all(
        "Sales Order",
        filters={"customer": customer_name},
        fields=["*"],
        order_by="creation desc"
    )

    return data




@frappe.whitelist()
def get_quotation_data(): #quotation data with all fields

    if frappe.session.user == "Guest":
        return []

    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": frappe.session.user},
        "parent"
    )

    if not customer_name:
        return []

    return frappe.get_all(
        "Quotation",
        filters={
            "docstatus": 1,
            "party_name": customer_name
        },
        fields=["*"],
        order_by="creation asc"
    )



@frappe.whitelist()
def get_delivery_note_data():  # delivery note data with all fields
    current_user = frappe.session.user
    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )

    if not customer_name:
        return []

    data = frappe.get_all(
        "Delivery Note",
        filters={
            "docstatus": 1,
            "customer": customer_name
        },
        fields=["*"],
        order_by="posting_date DESC"
    )

    return data


@frappe.whitelist()
def get_product_catalog():
    items = frappe.get_all(
        "Item",
        filters={
            "disabled": 0,
            "is_stock_item": 1
        },
        fields=["name", "item_name", "item_group"],
        order_by="item_name ASC",
        as_list=False
    )

    product_catalog = []

    for item in items:
        item_price = frappe.get_value(
            "Item Price",
            filters={
                "item_code": item.name,
                "selling": 1,
                "price_list": "Standard Selling"
            },
            fieldname="price_list_rate"
        )
        price = item_price if item_price is not None else 0

        bins = frappe.get_all(
            "Bin",
            filters={
                "item_code": item.name
            },
            fields=["actual_qty"],
            as_list=False
        )
        stock = sum([b.actual_qty for b in bins]) if bins else 0

        file_data = frappe.get_all(
            "File",
            filters={
                "attached_to_doctype": "Item",
                "attached_to_name": item.name,
                "is_private": 0
            },
            fields=["file_url"],
            order_by="creation DESC", 
            limit_page_length=1,
            as_list=False
        )
        image = file_data[0].file_url if file_data else None

        product_catalog.append({
            "id": item.name,
            "name": item.item_name,
            "price": price,
            "stock": stock,
            "category": item.item_group,
            "image": image
        })

    return product_catalog




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
        SELECT 
            NULL AS posting_date, 
            'Opening Balance' AS voucher_type, 
            NULL AS voucher_no, 
            0.0 AS debit, 
            0.0 AS credit, 
            0.0 AS balance, 
            1 AS sort_order
        
        UNION ALL
        
        -- Individual Transactions
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
        
        -- Total Debit/Credit Row
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
        
        -- Closing Balance Row
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
def create_sales_order(cart=None, delivery_date=None):
    if isinstance(cart, str):
        cart = frappe.parse_json(cart)

    if not cart:
        frappe.throw("Cart is empty")
    
    if not delivery_date:
        frappe.throw("Delivery date is required")

    current_user = frappe.session.user

    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )

    if not customer_name:
        frappe.throw("No Customer linked with this user")

    default_currency = frappe.db.get_value(
        "Customer",
        customer_name,
        "default_currency"
    )

    if not default_currency:
        frappe.throw(f"Default currency not set for Customer {customer_name}")

    today = date.today()

    try:
        items = []

        for row in cart:
            items.append({
                "item_code": row.get("id"),
                "qty": row.get("quantity"),
                "delivery_date": delivery_date, 
            })

        sales_order = frappe.get_doc({
            "doctype": "Sales Order",
            "customer": customer_name,
            "transaction_date": today,
            "delivery_date": delivery_date,
            "order_type": "Sales",
            "currency": default_currency,
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

 