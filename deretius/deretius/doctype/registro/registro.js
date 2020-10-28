// Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
// For license information, please see license.txt

frappe.ui.form.on('Registro', {
	onload: function(frm) {
		frm.set_query("titulo", function() {
			return {
				"filters": {
					"tipo_de_titulo": frm.doc.tipo_de_titulo
				}
			}
		})
	}
	// refresh: function(frm) {

	// }
});
