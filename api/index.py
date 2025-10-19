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

# Import and configure Django
import django
django.setup()

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application

# Initialize Django WSGI application
app = get_wsgi_application()

# Export for Vercel
# Vercel expects either 'app' or 'application' as the WSGI callable
application = app
