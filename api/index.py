"""
Vercel Serverless Function for Django API
"""
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adrd_kg.settings_vercel')

# Import Django application
import django
django.setup()

from django.core.handlers.wsgi import WSGIHandler
from django.http import HttpResponse

# Create WSGI application
application = WSGIHandler()

def handler(request, context):
    """Vercel serverless function handler"""
    return application(request, context)
