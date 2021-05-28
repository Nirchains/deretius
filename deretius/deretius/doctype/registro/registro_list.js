frappe.listview_settings['Registro'] = {
	onload: function(list_view) {
		list_view.page.add_menu_item(__("Imprimir emails: Título preparado"), function() {
            const registros = list_view.get_checked_items();
            console.log(list_view.get_checked_items(true));
			frappe.call({
				method: "deretius.deretius.doctype.registro.registro.get_communications",
                args: {registros: registros},
				callback: function(r) {
					if(r.message) {
                        const with_letterhead = 0;
                        const print_format = "Emails";
                        const json_string = JSON.stringify(r.message);
                        const url = '/api/method/frappe.utils.print_format.download_multi_pdf?' +
                        'doctype=' + encodeURIComponent("Communication") +
                        '&name=' + encodeURIComponent(json_string) +
                        '&format=' + encodeURIComponent(print_format) +
                        '&no_letterhead=' + (with_letterhead ? '0' : '1');
                        
                        const w = window.open(url);
                        if (!w) {
                            frappe.msgprint(__('Please enable pop-ups'));
                            return;
                        }
					}
					
				}
			});

            /*
            const default_print_format = frappe.get_meta(this.doctype).default_print_format;
            const with_letterhead = args.with_letterhead ? 1 : 0;
            const print_format = args.print_sel ? args.print_sel : default_print_format;
            const json_string = JSON.stringify(valid_docs);

            const w = window.open('/api/method/frappe.utils.print_format.download_multi_pdf?' +
                'doctype=' + encodeURIComponent(this.doctype) +
                '&name=' + encodeURIComponent(json_string) +
                '&format=' + encodeURIComponent(print_format) +
                '&no_letterhead=' + (with_letterhead ? '0' : '1'));
            if (!w) {
                frappe.msgprint(__('Please enable pop-ups'));
                return;
            }
            */

		});
	},

};
