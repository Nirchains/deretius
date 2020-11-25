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
					"label": "<i class='octicon octicon-repo'></i> Libros",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Pagina",
					"description": _("Páginas"),
					"label": "<i class='octicon octicon-book'></i> Páginas",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Registro",
					"description": _("Registros"),
					"label": "<i class='octicon octicon-clippy'></i> Registros",
					"onboard": 1,
				}
			]
		},
		{
			"label": _("CONFIGURACIÓN"),
			"icon": "fa fa-exclamation",
			"items": [
				{
					"type": "doctype",
					"name": "Tipo de titulo",
					"description": _("Tipo de titulo"),
					"label": "<i class='octicon octicon-bookmark'></i> Tipos de título",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Titulo",
					"description": _("Titulo"),
					"label": "<i class='octicon octicon-mortar-board'></i> Títulos",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Configuracion Deretius",
					"description": _("Configuracion Deretius"),
					"label": "<i class='octicon octicon-gear'></i> Configuración",
					"onboard": 1,
				}
			]
		}
	]
	
		
	
