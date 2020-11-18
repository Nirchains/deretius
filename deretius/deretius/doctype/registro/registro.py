# -*- coding: utf-8 -*-
# Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Registro(Document):               
    def autoname(self):
        self.set_default_registro()
        self.n_expediente_centro = "{0}-{1}".format(self.pagina, self.n_orden)
        self.name = self.n_expediente_centro
    
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
        
        if int(configuracion.n_reg_pagina) >= int(pagina_actual.n_pag):
            #creamos una nueva página si no existe ya
            if frappe.db.count("Pagina", filters={"libro": configuracion.libro_predeterminado, "n_pag": pagina_actual.n_pag })>=0:
                pagina_actual.n_pag = pagina_actual.n_pag + 1
                pagina_actual.insert()
                            
            configuracion.n_orden_siguiente = 1
            frappe.db.set_value("Configuracion Deretius", "Configuracion Deretius", "pagina_predeterminada", pagina_actual.name)
        else:          
            configuracion.n_orden_siguiente = int(configuracion.n_orden_siguiente) + 1

        frappe.db.set_value("Configuracion Deretius", "Configuracion Deretius", "n_orden_siguiente", str(configuracion.n_orden_siguiente))
        frappe.db.commit()