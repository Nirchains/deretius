// Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
// For license information, please see license.txt

cur_frm.add_fetch("titulo", "tipo", "tipo_de_titulo");

frappe.ui.form.on('Registro', {
	refresh: function(frm) {
		cur_frm.cscript.registro.control_de_estados(frm);
		
		if(frm.doc.__islocal) { 
            //Cargamos los parámetros por defecto       
            cur_frm.cscript.registro.set_defaults(frm);
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
	motivo: function(frm) {
		cur_frm.cscript.registro.check_properties(frm);
	},
	imprimir_documento: function (frm) {
		var format = "Documento de firma";
		var with_letterhead = true;
		var lang_code = "ES";
		var printit = true;
		var name_concat = "retirada";
		print.pdf(format, with_letterhead, lang_code, printit, name_concat);
		//print.html(format, with_letterhead, lang_code, printit);	
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
		cur_frm.cscript.registro.acciones_flujo(frm);
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
		frm.toggle_display("ss_retirada", frm.doc.estado_num > 2);
		//Estado duplicado
		util.toggle_display(frm, "ss_duplicado", frm.doc.duplicado==1);
		util.toggle_display(frm, "vinculo_boe", frm.doc.motivo=="Pérdida");
		util.toggle_display(frm, "referencia_boe", frm.doc.motivo=="Pérdida");
		util.toggle_display(frm, "vinculo_boe", frm.doc.motivo=="Pérdida");
		util.toggle_display(frm, "fecha_anuncio_boe", frm.doc.motivo=="Pérdida");
		util.toggle_display(frm, "importe", frm.doc.motivo=="Pérdida");
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
	enviar_email_titulo_preparado: function(frm){
		var d;	
		var args = {
			doc: frm.doc,
			frm: frm,
			//subject: __(frm.meta.name) + ': ' + frm.docname,
			subject: "asdf",
			recipients: frm.doc.email || frm.doc.email_id || frm.doc.contact_email,
			attach_document_print: false,
			message: "",
			email_template: "1-Titulo preparado para recogida",
			real_name: frm.doc.real_name || frm.doc.contact_display || frm.doc.contact_name
		}
		d = new frappe.views.CommunicationComposer(args);

		console.log(d);
		d.dialog.fields_dict.email_template.set_value(d.email_template || '');
		d.setup_email_template();
		
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
		newdoc.estado_num = -1;
		newdoc.duplicado = 1;
		newdoc.libro = null;
        newdoc.pagina = null;
		newdoc.n_orden = null;
		newdoc.fecha_remision_expediente = null;
		newdoc.fecha_abono_expedicion = null;
		newdoc.fecha_recepcion_titulo = null;
		newdoc.fecha_retirada = null;
		newdoc.observaciones_envio = null;
		newdoc.documento_retirada = null;
		newdoc.envio = null;
		newdoc.fecha_envio = null;

		frappe.set_route('Form', newdoc.doctype, newdoc.name);
	},
	control_de_estados: function(frm) {
		var estado_actual, estado_siguiente;
		switch (frm.doc.estado_num) {
			case 0:
				estado_actual = "Pendiente";
				estado_siguiente = "Solicitado";
				if (helper.IsNullOrEmpty(frm.doc.fecha_solicitud) || helper.IsNullOrEmpty(frm.doc.fecha_abono_expedicion)) {
					frm.dashboard.add_comment(__('Siguiente estado: ' + estado_siguiente + '<br>Campos obligatorios: "Fecha de solicitud", "Fecha de abono/expedicion"'), 'yellow', true);
				} else {
					frm.dashboard.add_comment(__('Preparado para pasar al estado "' + estado_siguiente + '". Pulse en "Acciones->' + estado_siguiente + '"'), 'blue', true);
				}
				break;
			case 1:
				estado_actual = estado_siguiente;
				estado_siguiente = "Remision de expediente";
				if (helper.IsNullOrEmpty(frm.doc.fecha_remision_expediente)) {
					frm.dashboard.add_comment(__('<b>Siguiente estado:</b> ' + estado_siguiente + '<br><b>Campos obligatorios:</b> "Fecha de remisión de expediente"'), 'yellow', true);
				} else {
					frm.dashboard.add_comment(__('Preparado para pasar al estado "' + estado_siguiente + '". Pulse en "Acciones->' + estado_siguiente + '"'), 'blue', true);
				}

				this.imprimir_resguardo_titulo(frm);

				break;

			case 2:
				estado_actual = estado_siguiente;
				estado_siguiente = "Recepcion del titulo";
				
				if (helper.IsNullOrEmpty(frm.doc.fecha_recepcion_titulo) || helper.IsNullOrEmpty(frm.doc.n_registro_nacional_titulos) || helper.IsNullOrEmpty(frm.doc.n_registro_universitario)) {
					frm.dashboard.add_comment(__('<b>Siguiente estado:</b> ' + estado_siguiente + '<br><b>Campos obligatorios:</b> "Fecha de recepción del título", "Nº de Registro Nacional de Títulos", "Nº de Registro Universitario"'), 'yellow', true);
				} else {
					frm.dashboard.add_comment(__('Preparado para pasar al estado "' + estado_siguiente + '". Pulse en "Acciones->' + estado_siguiente + '"'), 'blue', true);
				}
				break;
			case 3:
				estado_actual = estado_siguiente;
				estado_siguiente = "Titulo retirado";
				
				if (helper.IsNullOrEmpty(frm.doc.fecha_retirada)) {
					frm.dashboard.add_comment(__('<b>Siguiente estado:</b> ' + estado_siguiente + '<br><b>Campos obligatorios:</b> "Fecha de retirada"'), 'yellow', true);
				} else {
					frm.dashboard.add_comment(__('Preparado para pasar al estado "' + estado_siguiente + '". Pulse en "Acciones->' + estado_siguiente + '"'), 'blue', true);
				}

				frm.add_custom_button(__("Enviar correo título preparado"),
					function() {
						cur_frm.cscript.registro.enviar_email_titulo_preparado(frm);
					}
				);

				break;
			case 5:
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
				break;
		}
		
	},
	acciones_flujo: function(frm) {
		switch (frm.doc.estado_num) {
			case 0:
				//Pendiente
				
				break;
			case 1:
				//Solicitado
				
				break;

			case 2:
				//Remision de expediente
				
				break;
			case 3:
				//Recepcion del titulo
				this.enviar_email_titulo_preparado(frm);
				break;
			case 5:
				//Titulo retirado
				
				break;
				
		}
	},
	imprimir_resguardo_titulo: function(frm) {
		frm.add_custom_button(__("Imprimir resguardo de título"),
			function() {
				var format = "Resguardo de Título";
				var with_letterhead = true;
				var lang_code = "ES";
				var printit = true;
				var name_concat = "resguardo";
				print.pdf(format, with_letterhead, lang_code, printit, name_concat);
				//print.html(format, with_letterhead, lang_code, printit);
			}
		);
	}
};
