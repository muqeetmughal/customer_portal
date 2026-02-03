import frappe
from frappe import _

@frappe.whitelist()
def get_customer_dashboard_data():
    total_sales_amount = frappe.db.get_value("Sales Invoice", filters={"docstatus": 1}, fieldname="sum(grand_total)") or 0.0
    total_outstanding_amount = frappe.db.get_value("Sales Invoice", filters={"docstatus": 1, "outstanding_amount": [">", 0]}, fieldname="sum(outstanding_amount)") or 0.0


    return {
        "total_sales": {
            "amount": total_sales_amount,
            "change_percentage": 12.5, 
            "change_text": "vs last month"
        },
        "outstanding": {
            "amount": total_outstanding_amount,
            "change_percentage": -5.0,
            "change_text": "vs last month"
        },
        "paid_to_date": {
            "amount": 90000.00,
            "change_percentage": 18.0,
            "change_text": "vs last month"
        },
        "ledger_balance": {
            "amount": -35000.00
        }
    }


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
        # Fetch the 5 most recent records for each doctype
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
            
    # Sort all activities by timestamp descending and take the top 10
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return activities[:10]


@frappe.whitelist() #sales invoice data
def get_sales_invoice_data():
    data = frappe.db.sql("""
        SELECT
            name,
            posting_date,
            due_date,
            grand_total AS total,
            status
        FROM `tabSales Invoice`
        WHERE docstatus = 1
        ORDER BY posting_date DESC
    """, as_dict=True)

    return data



@frappe.whitelist()  #sales order data
def get_sales_order_data():
    return frappe.db.sql("""
        SELECT
            name,
            transaction_date,
            grand_total,
            status
        FROM `tabSales Order`
        WHERE docstatus = 1
        ORDER BY transaction_date DESC
    """, as_dict=True)


@frappe.whitelist()
def get_quotation_data(): #quotation data
    quotations = frappe.db.sql("""
        SELECT
            name,
            creation AS created_on,
            valid_till,
            grand_total,
            status
        FROM `tabQuotation`
        WHERE docstatus = 1
        ORDER BY creation DESC
    """, as_dict=True)

    return quotations



@frappe.whitelist()
def get_delivery_note_data(): #delivery note data
    delivery_notes = frappe.db.sql("""
        SELECT
            dn.name AS delivery_note,
            dni.against_sales_order AS sales_order,
            dn.posting_date,
            dn.status
        FROM `tabDelivery Note` dn
        JOIN `tabDelivery Note Item` dni
            ON dn.name = dni.parent
        WHERE dn.docstatus = 1
        ORDER BY dn.posting_date DESC
    """, as_dict=True)

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

