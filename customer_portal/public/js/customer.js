frappe.ui.form.on('Customer', {
    refresh: function(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__('Invite to Portal'), function() {
                frappe.confirm(
                    __('Are you sure you want to send a portal invitation to this customer?'),
                    function() {
                        frappe.call({
                            method: "customer_portal.api.customer_portal.send_welcome_email",
                            args: { 
                                customer_name: frm.doc.name 
                            },
                            callback: function(r) {
                                if(r.message) {
                                    frappe.msgprint(r.message);
                                }
                            }
                        });
                    }
                );
            }, __('Actions'));
        }
    }
});
