# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("DERETIUS"),
			"icon": "fa fa-exclamation",
			"items": [
				{
					"type": "doctype",
					"name": "Libro",
					"description": _("Libros"),
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Pagina",
					"description": _("Páginas"),
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Registro",
					"description": _("Registros"),
					"onboard": 1,
				}
			]
		},
		{
			"label": _("Configuración"),
			"icon": "fa fa-exclamation",
			"items": [
				{
					"type": "doctype",
					"name": "Tipo de titulo",
					"description": _("Tipo de titulo"),
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Titulo",
					"description": _("Titulo"),
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Configuracion Deretius",
					"description": _("Configuracion Deretius"),
					"onboard": 1,
				}
			]
		}
	]
	
		
	
