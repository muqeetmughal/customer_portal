import frappe

@frappe.whitelist()
def send_welcome_email(customer_name):
    # Get the Customer document
    customer = frappe.get_doc("Customer", customer_name)

    # Get the linked Address
    address_link = frappe.get_all(
        "Dynamic Link",
        filters={
            "link_doctype": "Customer",
            "link_name": customer_name,
            "parenttype": "Address"
        },
        fields=["parent"]
    )

    if not address_link:
        frappe.throw("No Address linked to this Customer.")

    # Get the Address document
    address = frappe.get_doc("Address", address_link[0].parent)

    if not address.email_id:
        frappe.throw("No email found in linked Address.")

    # Send the email immediately (not queued)
    frappe.sendmail(
        recipients=[address.email_id],
        subject="Welcome on Board",
        message=f"Hello {customer.customer_name},<br><br>Welcome on board!",
        now=True  # <-- ensures immediate sending
    )

    return f"Email sent successfully to {address.email_id}"
