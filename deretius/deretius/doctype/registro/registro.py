# -*- coding: utf-8 -*-
# Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Registro(Document):
	def autoname(self):
		self.n_expediente_centro = "{0}-{1}".format(self.pagina, self.n_orden)
		self.name = self.n_expediente_centro

	def onload(self):
		self.set_onload("libro", frappe.db.get_default("libro_predeterminado"))
		self.set_onload ("pagina", frappe.db.get_default("pagina_predeterminada"))
		self.set_onload("n_orden", 1)

	def set_default_registro(self):
		return frappe.db.get_singles_dict('Configuracion Deretius')
