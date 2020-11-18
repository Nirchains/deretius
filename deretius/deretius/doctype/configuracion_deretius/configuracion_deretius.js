// Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
// For license information, please see license.txt

frappe.ui.form.on('Configuracion Deretius', {
	onload: function(frm) {
		frm.set_query("pagina_predeterminada", function() {
			return {
				"filters": {
					"libro": frm.doc.libro_predeterminado
				}
			}
		})
	},
	libro_predeterminado: function(frm) {
		frm.set_value("pagina_predeterminada", "");
		frm.refresh_fields();
	}
});
