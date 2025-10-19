"""
Vercel Serverless Function for Django API
"""
import os
import sys
from pathlib import Path

# Add backend directory to Python path (now inside api folder)
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adrd_kg.settings_vercel')

# Import and configure Django
import django
django.setup()

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application

# Create the WSGI application
app = get_wsgi_application()

# Vercel expects a function or WSGI app
# Export both for compatibility
application = app

# Initialize database in background (don't block initial requests)
def _init_db():
    """Initialize database with migrations and sample data"""
    try:
        from django.core.management import call_command
        from django.db import connection
        
        # Check if tables exist
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
        
        # Run migrations if needed
        if not tables or len(tables) < 3:
            print("Running migrations...")
            call_command('migrate', '--noinput', verbosity=0)
            
            # Create sample data
            try:
                from api.models import Dataset, Publication
                if not Dataset.objects.exists():
                    Dataset.objects.create(
                        name="Sample ADRD Dataset",
                        description="Sample dataset for demonstration",
                        disease_type="Alzheimer's Disease",
                        sample_size=1000,
                        data_accessibility="Open",
                        wgs_available="Yes",
                        imaging_types="MRI, PET",
                        modalities="MRI, PET, Clinical"
                    )
                    Publication.objects.create(
                        title="Sample Publication",
                        authors="Sample Authors",
                        journal="Sample Journal",
                        year=2023,
                        pmid="12345678",
                        doi="10.1234/sample",
                        dataset_name="Sample ADRD Dataset"
                    )
                    print("Sample data created")
            except Exception as e:
                print(f"Sample data error: {e}")
    except Exception as e:
        print(f"DB init error: {e}")

# Try to initialize database
try:
    _init_db()
except:
    pass  # Don't crash if DB init fails
