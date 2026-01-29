import frappe
from frappe import _
from erpnext.accounts.utils import get_balance_on

@frappe.whitelist()
def get_customer_dashboard_data():


	return {
		"total_sales": {
			"amount": 125000.00,
			"change_percentage": 12.5,
			"change_text": "vs last month"
		},
		"outstanding": {
			"amount": 35000.00,
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

