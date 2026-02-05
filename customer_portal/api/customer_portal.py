import frappe
from frappe import _
from frappe.utils import now_datetime, add_days, generate_hash, get_url

@frappe.whitelist()
def send_welcome_email(customer_name):
    customer = frappe.get_doc("Customer", customer_name)
    
    email = None
    contact_links = frappe.get_all("Dynamic Link", 
        filters={"link_doctype": "Customer", "link_name": customer_name, "parenttype": "Contact"}, 
        fields=["parent"]
    )
    
    if contact_links:
        for link in contact_links:
            contact_email = frappe.db.get_value("Contact", link.parent, "email_id")
            if contact_email:
                email = contact_email
                break
    
    if not email:
        address_links = frappe.get_all("Dynamic Link", 
            filters={"link_doctype": "Customer", "link_name": customer_name, "parenttype": "Address"}, 
            fields=["parent"]
        )
        if address_links:
            for link in address_links:
                addr_email = frappe.db.get_value("Address", link.parent, "email_id")
                if addr_email:
                    email = addr_email
                    break
    
    if not email:
        frappe.throw(_("No email found for Customer {0}").format(customer_name))

    existing_invitation = frappe.db.get_value("Customer Portal Invitation", 
        {"customer": customer_name, "status": "Pending"}, "name")
    
    token = generate_hash(length=32)
    if existing_invitation:
        invitation = frappe.get_doc("Customer Portal Invitation", existing_invitation)
        invitation.token = token
        invitation.email = email
        invitation.status = "Pending"
        invitation.expiry_time = add_days(now_datetime(), 7)
        invitation.save(ignore_permissions=True)
    else:
        invitation = frappe.get_doc({
            "doctype": "Customer Portal Invitation",
            "customer": customer_name,
            "email": email,
            "token": token,
            "status": "Pending",
            "expiry_time": add_days(now_datetime(), 7),
            "invited_by": frappe.session.user
        })
        invitation.insert(ignore_permissions=True)

    base_url = get_url()
    accept_link = f"{base_url}/accept-invitation?token={token}"
    reject_link = f"{base_url}/api/method/customer_portal.api.customer_portal.reject_invitation?token={token}"

    subject = _("Invitation to Customer Portal")
    message = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
            <h3 style="color: #333;">Hello {customer.customer_name or customer_name},</h3>
            <p style="color: #555; font-size: 16px;">You have been invited to access our customer portal. Please choose one of the options below to proceed:</p>
            <div style="margin: 40px 0; text-align: center;">
                <a href="{accept_link}" style="background-color: #28a745; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 15px; display: inline-block;">Accept Invitation</a>
                <a href="{reject_link}" style="background-color: #dc3545; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reject Invitation</a>
            </div>
            <p style="color: #888; font-size: 0.85em; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">This invitation will expire in 7 days.</p>
        </div>
    """
    
    frappe.sendmail(
        recipients=[email],
        subject=subject,
        message=message,
        now=True
    )

    return _("Invitation sent successfully to {0}").format(email)

@frappe.whitelist(allow_guest=True)
def accept_invitation(token, password):
    invitation_data = frappe.db.get_value("Customer Portal Invitation", 
        {"token": token, "status": "Pending"}, 
        ["name", "customer", "email", "expiry_time"], as_dict=True)
    
    if not invitation_data:
        return {"status": "error", "message": _("Invalid or already processed invitation.")}
    
    if invitation_data.expiry_time < now_datetime():
        frappe.db.set_value("Customer Portal Invitation", invitation_data.name, "status", "Expired")
        return {"status": "error", "message": _("Invitation has expired.")}

    try:
        user_email = invitation_data.email
        if not frappe.db.exists("User", user_email):
            user = frappe.get_doc({
                "doctype": "User",
                "email": user_email,
                "first_name": invitation_data.customer,
                "enabled": 1,
                "send_welcome_email": 0,
                "user_type": "Website User"
            })
            user.insert(ignore_permissions=True)
            user.add_roles("Customer")
        else:
            user = frappe.get_doc("User", user_email)

        from frappe.utils.password import update_password
        update_password(user.name, password)

        customer_doc = frappe.get_doc("Customer", invitation_data.customer)
        user_exists_in_table = False
        for row in customer_doc.get("portal_users", []):
            if row.user == user.name:
                user_exists_in_table = True
                break
        
        if not user_exists_in_table:
            customer_doc.append("portal_users", {"user": user.name})
            customer_doc.save(ignore_permissions=True)

        frappe.db.set_value("Customer Portal Invitation", invitation_data.name, {
            "status": "Accepted",
            "accepted_on": now_datetime(),
            "created_user": user.name
        })

        frappe.db.commit()
        return {"status": "success", "message": _("Account created successfully.")}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Invitation Acceptance Failed"))
        return {"status": "error", "message": str(e)}

@frappe.whitelist(allow_guest=True)
def reject_invitation(token):
    invitation_name = frappe.db.get_value("Customer Portal Invitation", {"token": token, "status": "Pending"}, "name")
    
    if not invitation_name:
        frappe.respond_as_web_page(_("Invalid Invitation"), _("This invitation is invalid or has already been processed."))
        return

    frappe.db.set_value("Customer Portal Invitation", invitation_name, "status", "Revoked")
    frappe.db.commit()
    
    frappe.respond_as_web_page(_("Invitation Rejected"), _("Thanks for your time."))
