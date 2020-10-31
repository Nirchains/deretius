// Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
// For license information, please see license.txt

cur_frm.add_fetch("titulo", "tipo", "tipo_de_titulo");

frappe.ui.form.on('Registro', {
	onload: function(frm) {
		frm.set_query("titulo", function() {
			return {
				"filters": {
					"tipo": frm.doc.tipo_de_titulo
				}
			}
		})
	}
	// refresh: function(frm) {

	// }
});
