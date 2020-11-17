# -*- coding: utf-8 -*-
from frappe import _

def get_data():
	return {
		'heatmap': False,
		'heatmap_message': _('This is based on the Time Sheets created against this project'),
		'fieldname': 'libro',
		'transactions': [
			{
				'label': _('Libro'),
				'items': ['Pagina', 'Registro'],
			}
		]
	}