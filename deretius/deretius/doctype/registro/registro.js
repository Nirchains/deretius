// Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
// For license information, please see license.txt

cur_frm.add_fetch("titulo", "tipo", "tipo_de_titulo");

frappe.ui.form.on('Registro', {
	refresh: function(frm) {
		if(frm.doc.__islocal) { 
            //Cargamos los parámetros por defecto       
            cur_frm.cscript.registro.set_defaults(frm);
		}
		if (frm.doc.estado_num == 5) {
			frm.add_custom_button(__("Expedir duplicado"),
				function() {
					var me = frm;
					var fn = function(newdoc) {
						newdoc.amended_from_copy = me.docname;
						if (me.fields_dict && me.fields_dict['amendment_date'])
							newdoc.amendment_date = frappe.datetime.obj_to_str(new Date());
					};
					cur_frm.cscript.registro.copy_doc(fn, 1, me.docname, frm);
				}
			);
		}
        cur_frm.cscript.registro.check_properties(frm);
	},
	onload: function(frm) {
		frm.set_query("titulo", function() {
			return {
				"filters": {
					"tipo": frm.doc.tipo_de_titulo
				}
			}
		})
	},
	imprimir_documento: function (frm) {
		var format = "Documento de firma";
		var with_letterhead = true;
		var lang_code = "ES";
		var printit = true;
		//print.pdf(format, with_letterhead, lang_code, printit);
		print.html(format, with_letterhead, lang_code, printit);	
	},
	before_workflow_action: function(frm) {
		/*return new Promise(resolve => {
			frappe.confirm(__("Permanently Submit?"), function() {
				resolve(me);
			}, 
			() => cur_frm.cscript.registro.cancelar_estado(frm));
		});*/			
	},
	after_workflow_action: function(frm, cdt, cdn) {
		cur_frm.cscript.registro.enviar_email(frm);
	}
});


cur_frm.cscript.registro = {
	check_properties: function(frm) {
		//Estado solicitado
		util.toggle_display(frm, "fecha_remision_expediente", frm.doc.estado_num > 0);
		//Estado remisión de expediente
		util.toggle_display(frm, "fecha_recepcion_titulo", frm.doc.estado_num > 1);
		util.toggle_display(frm, "n_registro_nacional_titulos", frm.doc.estado_num > 1);
		util.toggle_display(frm, "n_registro_universitario", frm.doc.estado_num > 1);
		//Estado Recepción del título
		//frm.toggle_display("ss_4", frm.doc.estado_num > 3);
    },
    set_defaults: function(frm) {
        util.set_value_if_no_null(frm, "estado_num", 0);       
        util.load_incidencias_template(frm, "incidencias");
        frm.set_value("libro", "");
        frm.set_value("pagina", "");
        frm.set_value("n_orden", "");
        frm.set_value("fecha_solicitud", frappe.datetime.get_today());
        frm.set_value("fecha_abono_expedicion", frappe.datetime.get_today());
        frm.set_value("fecha_remision_expediente", "");
        frm.set_value("fecha_recepcion_titulo", "");
		frm.refresh_fields();
		util.import_template_documents(frm, "documentacion", "documentacion");
	},
	enviar_email: function(frm){
		var d;	
		if (frm.doc.estado_num == 4) {
			var args = {
				doc: frm.doc,
				frm: frm,
				subject: __(frm.meta.name) + ': ' + frm.docname,
				recipients: frm.doc.email || frm.doc.email_id || frm.doc.contact_email,
				attach_document_print: false,
				message: "",
				email_template: "Título preparado para recogida",
				real_name: frm.doc.real_name || frm.doc.contact_display || frm.doc.contact_name
			}
			d = new frappe.views.CommunicationComposer(args);
		}
		return d;
	},
	cancelar_estado: function(frm) {

	},
	copy_doc(onload, from_amend, amended_from_copy, frm) {
		frm.validate_form_action("Create");
		var newdoc = frappe.model.copy_doc(frm.doc, from_amend);

		newdoc.idx = null;
		newdoc.__run_link_triggers = false;
		if(onload) {
			onload(newdoc);
		}
		
		//Campos reiniciados
		newdoc.duplicado = 1;
		newdoc.libro = null;
        newdoc.pagina = null;
		newdoc.n_orden = null;
		newdoc.fecha_remision_expediente = null;
		newdoc.fecha_recepcion_titulo = null;
		newdoc.fecha_retirada = null;
		newdoc.observaciones_envio = null;
		newdoc.documento_retirada = null;
		newdoc.envio = null;
		newdoc.fecha_envio = null;

		frappe.set_route('Form', newdoc.doctype, newdoc.name);
	}
};
