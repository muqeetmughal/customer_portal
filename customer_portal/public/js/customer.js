frappe.ui.form.on('Customer', {
    refresh: function(frm) {
        const btn = frm.add_custom_button(__('Invite to Portal'), function() {
            frappe.call({
                method: "customer_portal.api.customer_portal.send_welcome_email",
                args: { customer_name: frm.doc.name },
                callback: function(r) {
                    if(r.message) {
                        frappe.msgprint(r.message);
                    }
                }
            });
        });

        $(btn).parent().prependTo($(btn).parent().parent());
    }
});
