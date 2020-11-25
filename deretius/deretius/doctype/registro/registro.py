# -*- coding: utf-8 -*-
# Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Registro(Document):               
    def autoname(self):
        self.set_default_registro()
        self.name = self.get_name(self.pagina, self.n_orden)
    
    def before_insert(self):
        self.set_default_registro()

    def after_insert(self):
        self.update_default_registro()

    def get_default_registro(self):
        return frappe.db.get_singles_dict('Configuracion Deretius')
        
    def set_default_registro(self):
        configuracion = self.get_default_registro()
        self.libro = configuracion.libro_predeterminado
        self.pagina = configuracion.pagina_predeterminada
        self.n_orden = configuracion.n_orden_siguiente

    def update_default_registro(self):
        configuracion = self.get_default_registro()

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