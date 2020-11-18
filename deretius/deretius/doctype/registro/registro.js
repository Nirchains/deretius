// Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
// For license information, please see license.txt

cur_frm.add_fetch("titulo", "tipo", "tipo_de_titulo");

frappe.ui.form.on('Registro', {
	refresh: function(frm) {
		if(frm.doc.__islocal) {           
			frappe.call({
				doc: frm.doc,
				method: "set_default_registro",
				callback: function(r) {
					if (!helper.IsNullOrEmpty(r.message)) {
						util.set_value_if_no_null(frm, "libro", r.message.libro_predeterminado);
						util.set_value_if_no_null(frm, "pagina", r.message.pagina_predeterminada);
						util.set_value_if_no_null(frm, "n_orden", r.message.n_orden_siguiente);
					}
				}
			});
            util.set_value_if_no_null(frm, "estado_num", 0);
            
            util.load_incidencias_template(frm, "incidencias");
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
	after_workflow_action: function(frm, cdt, cdn){	
		if (frm.doc.estado_num == 4); {
			new frappe.views.CommunicationComposer({
				doc: frm.doc,
				frm: frm,
				subject: __(frm.meta.name) + ': ' + frm.docname,
				recipients: frm.doc.email || frm.doc.email_id || frm.doc.contact_email,
				attach_document_print: true,
				message: "",
				email_template: "Título preparado para recogida",
				real_name: frm.doc.real_name || frm.doc.contact_display || frm.doc.contact_name
			});
		}
		
		//if (frm.doc.estado && frm.doc.estado == "Remision de expediente"){
			return false;
			console.log("estado:" + frm.doc.estado);
			frappe.prompt([
				{
					fieldtype: 'Small Text',
					reqd: true,
					fieldname: 'reason'
				}],
				function(args){
					validated = true;
					frappe.call({
						method: 'frappe.core.doctype.communication.email.make',
						args: {
							doctype: frm.doctype,
							name: frm.docname,
							subject: format(__('Reason for {0}'), [frm.doc.workflow_state]),
							content: args.reason,
							send_mail: false,
							send_me_a_copy: false,
							communication_medium: 'Other',
							sent_or_received: 'Sent'
						},
						callback: function(res){
							if (res && !res.exc){
								frappe.call({
									method: 'frappe.client.set_value',
									args: {
										doctype: frm.doctype,
										name: frm.docname,
										fieldname: 'rejection_reason',
										value: frm.doc.rejection_reason ?
											[frm.doc.rejection_reason, frm.doc.workflow_state].join('\n') : frm.doc.workflow_state
									},
									callback: function(res){
										if (res && !res.exc){
											frm.reload_doc();
										}
									}
								});
							}
						}
					});
				},
				__('Reason for ') + __(frm.doc.workflow_state),
				__('End as Rejected')
			)
		//}
	}
});


cur_frm.cscript.registro = {
	check_properties: function(frm) {
		//Estado solicitado
		util.toggle_display_and_required(frm, "fecha_remision_expediente", frm.doc.estado_num > 0);
		//Estado remisión de expediente
		util.toggle_display_and_required(frm, "fecha_recepcion_titulo", frm.doc.estado_num > 1);
		util.toggle_display_and_required(frm, "n_registro_nacional_titulos", frm.doc.estado_num > 1);
		util.toggle_display_and_required(frm, "n_registro_universitario", frm.doc.estado_num > 1);
		//Estado Recepción del título
		frm.toggle_display("ss_4", frm.doc.estado_num > 3);
	}
};