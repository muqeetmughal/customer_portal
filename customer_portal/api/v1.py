import frappe
from frappe import _
from frappe.utils import getdate, add_months, today, get_first_day, get_last_day, nowdate, flt
from datetime import date

@frappe.whitelist()
def get_customer_dashboard_data():
    current_user = frappe.session.user
    customer_name = frappe.db.get_value(
        "Portal User",
        {"user": current_user},
        "parent"
    )

    if not customer_name:
        return {
            "total_sales": {"amount": 0, "change_percentage": 0, "change_text": "vs last month"},
            "outstanding": {"amount": 0, "change_percentage": 0, "change_text": "vs last month"},
            "paid_to_date": {"amount": 0, "change_percentage": 0, "change_text": "vs last month"},
            "ledger_balance": {"amount": 0}
        }

    customer = customer_name
    today = getdate(nowdate())
    current_month_start = get_first_day(today)
    current_month_end = get_last_day(today)
    last_month_date = add_months(today, -1)
    last_month_start = get_first_day(last_month_date)
    last_month_end = get_last_day(last_month_date)

    # Fetch all relevant Sales Invoices
    all_sales_invoices = frappe.get_list(
        "Sales Invoice",
        filters={
            "docstatus": 1,
            "customer": customer,
            "posting_date": ["between", [last_month_start, current_month_end]]
        },
        fields=["name", "posting_date", "grand_total", "outstanding_amount", "base_grand_total"],
        as_list=False
    )

    current_month_sales = 0.0
    last_month_sales = 0.0
    current_month_outstanding = 0.0
    last_month_outstanding = 0.0
    current_month_received = 0.0
    last_month_received = 0.0
    ledger_balance_amount = 0.0

    for invoice in all_sales_invoices:
        invoice_posting_date = getdate(invoice.posting_date)

        if current_month_start <= invoice_posting_date <= current_month_end:
            current_month_sales += float(invoice.grand_total or 0)
            current_month_outstanding += float(invoice.outstanding_amount or 0)
            current_month_received += (float(invoice.base_grand_total or 0) - float(invoice.outstanding_amount or 0))
        elif last_month_start <= invoice_posting_date <= last_month_end:
            last_month_sales += float(invoice.grand_total or 0)
            last_month_outstanding += float(invoice.outstanding_amount or 0)
            last_month_received += (float(invoice.base_grand_total or 0) - float(invoice.outstanding_amount or 0))

        ledger_balance_amount += (float(invoice.grand_total or 0) - float(invoice.outstanding_amount or 0))

    total_sales_change = ((current_month_sales - last_month_sales) / last_month_sales * 100) if last_month_sales else 0.0
    outstanding_change = ((current_month_outstanding - last_month_outstanding) / last_month_outstanding * 100) if last_month_outstanding else 0.0
    paid_to_date_change = ((current_month_received - last_month_received) / last_month_received * 100) if last_month_received else 0.0

    return {
        "total_sales": {
            "amount": current_month_sales,
            "change_percentage": round(max(-100, min(total_sales_change, 100)), 2),
            "change_text": "vs last month"
        },
        "outstanding": {
            "amount": current_month_outstanding,
            "change_percentage": round(max(-100, min(outstanding_change, 100)), 2),
            "change_text": "vs last month"
        },
        "paid_to_date": {
            "amount": current_month_received,
            "change_percentage": round(max(-100, min(paid_to_date_change, 100)), 2),
            "change_text": "vs last month"
        },
        "ledger_balance": {
            "amount": ledger_balance_amount
        }
    }



@frappe.whitelist() #sales velocity line chart data 
def get_sales_velocity_monthly(from_date=None, to_date=None):
    if not to_date:
        to_date = today()

    if not from_date:
        from_date = add_months(to_date, -12)

    from_date = getdate(from_date)
    to_date = getdate(to_date)

    data = frappe.get_all(
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

    return {
        "labels": [d["month_name"] for d in data],
        "orders": [d["invoice_count"] for d in data],
        "sales": [float(d["total_sales"] or 0) for d in data],
        "raw": data
    }



@frappe.whitelist()
def get_sales_invoice_status_count(): # sales invoice pie chart data 
    result = frappe.get_all(
        "Sales Invoice",
        filters={
            "status": ["in", ["Draft", "Overdue", "Paid"]]
        },
        fields=["status", "count(name) as count"],
        group_by="status"
    )

    counts = {"Draft": 0, "Overdue": 0, "Paid": 0}
    for row in result:
        counts[row["status"]] = row["count"]

    return counts


@frappe.whitelist()
def get_top_selling_items(limit=10):
    valid_sales_invoice_names = frappe.get_list(
        "Sales Invoice",
        filters={
            "docstatus": 1
        },
        fields=["name"],
        as_list=True
    )

    valid_sales_invoice_names = [name[0] for name in valid_sales_invoice_names]

    data = frappe.get_all(
        "Sales Invoice Item",
        filters={
            "parent": ["in", valid_sales_invoice_names]
        },
        fields=[
            "item_name as name",
            "count(name) as sales_count"
        ],
        group_by="item_name",
        order_by="sales_count DESC",
        limit_page_length=limit
    )

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



@frappe.whitelist()
def get_hot_items():
    # current month sales
    curr_sales = frappe.db.sql("""
        SELECT
            sii.item_code,
            SUM(sii.qty) AS sales_count,
            SUM(sii.qty * sii.rate) AS revenue
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON sii.parent = si.name
        WHERE si.docstatus = 1
          AND MONTH(si.posting_date) = MONTH(CURDATE())
          AND YEAR(si.posting_date) = YEAR(CURDATE())
        GROUP BY sii.item_code
    """, as_dict=1)

    #  previous month sales
    prev_sales = frappe.db.sql("""
        SELECT
            sii.item_code,
            SUM(sii.qty) AS sales_count,
            SUM(sii.qty * sii.rate) AS revenue
        FROM `tabSales Invoice Item` sii
        JOIN `tabSales Invoice` si ON sii.parent = si.name
        WHERE si.docstatus = 1
          AND MONTH(si.posting_date) = MONTH(CURDATE() - INTERVAL 1 MONTH)
          AND YEAR(si.posting_date) = YEAR(CURDATE() - INTERVAL 1 MONTH)
        GROUP BY sii.item_code
    """, as_dict=1)

    prev_dict = {item['item_code']: item for item in prev_sales}

    result = []
    for item in curr_sales:
        prev = prev_dict.get(item['item_code'], {'sales_count': 0, 'revenue': 0})

        sales_count = flt(item['sales_count'])
        prev_sales_count = flt(prev['sales_count'])

        revenue = flt(item['revenue'])
        prev_revenue = flt(prev['revenue'])

        if prev_sales_count > 0:
            growth = round((sales_count - prev_sales_count) / prev_sales_count * 100)
        else:
            growth = 100  

        growth = max(1, min(growth, 100))

        result.append({
            "name": frappe.get_value("Item", item['item_code'], "item_name"),
            "sales": int(sales_count),
            "revenue": f"${revenue:,.0f}",
            "growth": f"+{growth}%" if sales_count >= prev_sales_count else f"-{growth}%"
        })

    # Sort by top 10 hot items
    result.sort(key=lambda x: x['sales'], reverse=True)
    return result[:10]