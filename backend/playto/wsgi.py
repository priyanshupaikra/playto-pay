"""
WSGI config for playto project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'playto.settings.production')

application = get_wsgi_application()
