import frappe
from frappe import _
from frappe.utils import getdate, add_months, today

import frappe
from frappe.utils import today

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
        WHERE docstatus = 1 AND customer = %s
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
def is_customer():
	return {
		"is_customer" : True
	}

	# """
	# Returns customer dashboard statistics including sales, outstanding, paid amounts and ledger balance
	# """
	# customer = frappe.session.user

	# # Get current month data
	# from frappe.utils import (
	# 	nowdate,
	# 	get_first_day,
	# 	get_last_day,
	# 	add_months,
	# 	flt
	# )

	# current_month_start = get_first_day(nowdate())
	# current_month_end = get_last_day(nowdate())

	# last_month_start = get_first_day(add_months(nowdate(), -1))
	# last_month_end = get_last_day(add_months(nowdate(), -1))

	# # Get customer name from contact
	# customer_name = frappe.db.get_value(
	# 	"Contact",
	# 	{"user": customer},
	# 	"name"
	# )

	# if customer_name:
	# 	customer_link = frappe.db.get_value(
	# 		"Dynamic Link",
	# 		{
	# 			"link_doctype": "Customer",
	# 			"parenttype": "Contact",
	# 			"parent": customer_name
	# 		},
	# 		"link_name"
	# 	)
	# else:
	# 	customer_link = None

	# # Calculate current month sales
	# current_sales = frappe.db.sql("""
	# 	SELECT SUM(grand_total) as total
	# 	FROM `tabSales Invoice`
	# 	WHERE customer = %s
	# 	AND docstatus = 1
	# 	AND posting_date BETWEEN %s AND %s
	# """, (customer_link, current_month_start, current_month_end), as_dict=True)[0].total or 0

	# # Calculate last month sales
	# last_sales = frappe.db.sql("""
	# 	SELECT SUM(grand_total) as total
	# 	FROM `tabSales Invoice`
	# 	WHERE customer = %s
	# 	AND docstatus = 1
	# 	AND posting_date BETWEEN %s AND %s
	# """, (customer_link, last_month_start, last_month_end), as_dict=True)[0].total or 0

	# # Calculate sales percentage change
	# sales_change = ((current_sales - last_sales) / last_sales * 100) if last_sales else 0

	# # Get outstanding amount
	# outstanding = frappe.db.get_value(
	# 	"Customer",
	# 	customer_link,
	# 	"total_unpaid"
	# ) or 0

	# # Calculate paid to date (total invoiced - outstanding)
	# total_invoiced = frappe.db.sql("""
	# 	SELECT SUM(grand_total) as total
	# 	FROM `tabSales Invoice`
	# 	WHERE customer = %s
	# 	AND docstatus = 1
	# """, (customer_link,), as_dict=True)[0].total or 0

	# paid_to_date = total_invoiced - outstanding

	# # Get ledger balance
	# ledger_balance = get_balance_on(party_type="Customer", party=customer_link)

	# return {
	# 	"total_sales": {
	# 		"amount": flt(current_sales, 2),
	# 		"change_percentage": flt(sales_change, 2),
	# 		"change_text": "vs last month"
	# 	},
	# 	"outstanding": {
	# 		"amount": flt(outstanding, 2),
	# 		"change_percentage": -5.0,  # Calculate based on previous period
	# 		"change_text": "vs last month"
	# 	},
	# 	"paid_to_date": {
	# 		"amount": flt(paid_to_date, 2),
	# 		"change_percentage": 18.0,  # Calculate based on previous period
	# 		"change_text": "vs last month"
	# 	},
	# 	"ledger_balance": {
	# 		"amount": flt(ledger_balance, 2)
	# 	}
	# }

@frappe.whitelist()
def get_product_catalog():
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
