# -*- coding: utf-8 -*-
# Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cstr, getdate, add_days, today, get_last_day, get_first_day, month_diff

class Registro(Document):               
    def autoname(self):
        self.set_default_registro()
        self.name = self.get_name(self.pagina, self.n_orden)
        self.codigo = self.name

    def validate(self):
        duplicidad = self.comprobar_duplicidad()
        if duplicidad["result"]:
            frappe.throw("No ha sido posible guardar el registro. {0}".format(duplicidad["msg"]))
    
    def before_insert(self):
        self.set_default_registro()

    def after_insert(self):
        self.update_default_registro()
       
    def set_default_registro(self):
        configuracion = get_default_registro()
        self.libro = configuracion.libro_predeterminado
        self.pagina = configuracion.pagina_predeterminada
        self.n_orden = configuracion.n_orden_siguiente

    def update_default_registro(self):
        configuracion = get_default_registro()

        pagina_actual = frappe.get_doc("Pagina", configuracion.pagina_predeterminada)
        
        #En caso de que se superen el número de registros por página
        if int(configuracion.n_orden_siguiente) >= int(configuracion.n_reg_pagina):
            pagina_actual.n_pag = int(pagina_actual.n_pag) + 1
            #creamos una nueva página si no existe ya. Si existe usamos la anterior
            if frappe.db.count("Pagina", filters={"libro": configuracion.libro_predeterminado, "n_pag": pagina_actual.n_pag })==0:
                pagina_actual = pagina_actual.insert(ignore_permissions=True)
            else:
                pagina_actual = frappe.get_doc("Pagina", self.get_name(configuracion.libro_predeterminado, pagina_actual.n_pag))

            #Reiniciamos el contador                
            configuracion.n_orden_siguiente = 1
            #Actualizamos la configuracion con la página predeterminada
            frappe.db.set_value("Configuracion Deretius", "Configuracion Deretius", "pagina_predeterminada", pagina_actual.name)
        else:          
            configuracion.n_orden_siguiente = int(configuracion.n_orden_siguiente) + 1

        frappe.db.set_value("Configuracion Deretius", "Configuracion Deretius", "n_orden_siguiente", configuracion.n_orden_siguiente)
        frappe.db.commit()

    def get_name(self, pagina, n_orden):
        return "{0}-{1}".format(pagina, n_orden)

    def comprobar_duplicidad(self):
        ret = {
            "result": False,
            "msg": ""
        }
        if self.titulo and self.n_doc:
            filters = dict(
		        titulo = self.titulo,
		        n_doc = self.n_doc,
		        name = ('!=', self.name),
                duplicado = self.duplicado
            )
            if frappe.db.count("Registro", filters=filters)>0:
                name = frappe.db.get_value("Registro", filters={"titulo": self.titulo, "n_doc": self.n_doc}, fieldname="name")
                ret["result"] = True
                ret["msg"] = "Ya existe otro registro para esta persona con el mismo DNI y titulación: Puede acceder a través del siguiente enlace <a href='desk#Form/Registro/{0}'>{0}</a>".format(name)

        return ret
        

def get_default_registro():
    return frappe.db.get_singles_dict('Configuracion Deretius')

def comprobar_libro():
    configuracion = get_default_registro()

    fecha_inicio_curso = getdate(configuracion.fecha_inicio_curso)
    hoy = getdate(today())

    if fecha_inicio_curso == hoy:
        libro_actual = frappe.get_doc("Libro", configuracion.libro_predeterminado)
        if frappe.db.count("Libro", filters={"ordinal": int(libro_actual.ordinal) + 1 })==0:
            libro_nuevo = frappe.new_doc("Libro")
            libro_nuevo.ordinal = int(libro_actual.ordinal) + 1
            libro_nuevo.curso_academico = "{0}/{1}".format(hoy.year, hoy.year+1)
            libro_nuevo = libro_nuevo.insert()
        else:
            libro_nuevo = frappe.get_list("Libro", filters={"ordinal": int(libro_actual.ordinal) + 1 })[0]

        if frappe.db.count("Pagina", filters={"libro": libro_nuevo.name, "n_pag": 1 })==0:
            pagina = frappe.new_doc("Pagina")
            pagina.libro = libro_nuevo.name
            pagina.n_pag = 1
            pagina = pagina.insert()
        else:
            pagina = frappe.get_list("Pagina", filters={"libro": libro_nuevo.name, "n_pag": 1 })[0]

        frappe.db.set_value("Configuracion Deretius", "Configuracion Deretius", "libro_predeterminado", libro_nuevo.name)
        frappe.db.set_value("Configuracion Deretius", "Configuracion Deretius", "pagina_predeterminada", pagina.name)
        frappe.db.set_value("Configuracion Deretius", "Configuracion Deretius", "n_orden_siguiente", 1)
        frappe.db.commit()
    else:
        print("no es hoy")

@frappe.whitelist()
def get_communications(registros):
    import json
    reg = json.loads(registros)
    com_list = []
    
    condition = " and subject like %s "
    subject = "%{0}%".format("TITULO PREPARADO PARA RECOGIDA")
    
    if reg:
        sql = """
            select name from `tabCommunication` 
            where
            reference_name in (%s) 
             """  % (",".join(["%s"] * len(reg)))
                    
        com_list = frappe.db.sql("{0} {1}".format(sql, condition), tuple(r["name"] for r in reg ) + tuple([subject]) , debug=True)   
        
    
    return tuple(v[0] for v in com_list)