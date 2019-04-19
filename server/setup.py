# -*- coding: utf-8 -*-
from distutils.core import setup

packages = \
['bus_me', 'bus_me.__types', 'bus_me.authentication', 'bus_me.endpoint']

package_data = \
{'': ['*'],
 'bus_me': ['config/.gitignore',
            'config/.gitignore',
            'config/default.yaml',
            'config/default.yaml']}

install_requires = \
['aiocache>=0.10.1,<0.11.0',
 'aiohttp>=3.5,<4.0',
 'aiopg>=0.16.0,<0.17.0',
 'attributedict>=0.3.0,<0.4.0',
 'config2>=0.3.1,<0.4.0',
 'cryptography>=2.6,<3.0',
 'peewee-async>=0.5.12,<0.6.0',
 'pyjwt>=1.7,<2.0',
 'python-socketio>=4.0,<5.0',
 'websockets>=7.0,<8.0']

entry_points = \
{'console_scripts': ['start = bus_me:main']}

setup_kwargs = {
    'name': 'bus-me',
    'version': '0.1.0',
    'description': 'Bus Me backend',
    'long_description': None,
    'author': 'Shane Duan',
    'author_email': 's_duan@u.pacific.edu',
    'url': None,
    'packages': packages,
    'package_data': package_data,
    'install_requires': install_requires,
    'entry_points': entry_points,
    'python_requires': '>=3.6,<4.0',
}


setup(**setup_kwargs)
