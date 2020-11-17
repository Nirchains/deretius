# -*- coding: utf-8 -*-
# Copyright (c) 2020, Pedro Antonio Fernandez Gomez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Libro(Document):
	def autoname(self):
		self.romano = int_to_roman(int(self.ordinal))
		self.name = self.romano

def int_to_roman(input):
	""" Convert an integer to a Roman numeral. """
	if not isinstance(input, type(1)):
		frappe.throw("Se esperaba un número entero")
	if not 0 < input < 4000:
		frappe.throw("El valor debe estar comprendido entre 1 y 3999")
	ints = (1000, 900,  500, 400, 100,  90, 50,  40, 10,  9,   5,  4,   1)
	nums = ('M',  'CM', 'D', 'CD','C', 'XC','L','XL','X','IX','V','IV','I')
	result = []
	for i in range(len(ints)):
		count = int(input / ints[i])
		result.append(nums[i] * count)
		input -= ints[i] * count
	return ''.join(result)