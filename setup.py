# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in deretius/__init__.py
from deretius import __version__ as version

setup(
	name='deretius',
	version=version,
	description='Registro de titulos de Derecho',
	author='Pedro Antonio Fernandez Gomez',
	author_email='pedro@hispalisdigital.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
