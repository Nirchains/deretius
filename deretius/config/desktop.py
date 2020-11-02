# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Deretius",
			"color": "grey",
			"icon": "octicon octicon-file-directory",
			"type": "module",
			"label": _("Deretius")
		},
		{
			"label": _("DERETIUS"),
			"icon": "fa fa-exclamation",
			"items": [
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
				}
			]
		}
	]
	
		
	
