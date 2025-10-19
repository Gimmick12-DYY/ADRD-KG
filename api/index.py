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

# Run migrations and load sample data
from django.core.management import call_command
from django.db import connection

def init_database():
    """Initialize database with migrations and sample data"""
    try:
        # Check if database tables exist
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
        
        # If no tables exist, run migrations and load data
        if not tables or len(tables) < 3:
            print("Initializing database...")
            call_command('migrate', '--noinput')
            
            # Load sample data if available
            try:
                call_command('load_sample_data')
                print("Sample data loaded successfully")
            except Exception as e:
                print(f"Could not load sample data: {e}")
                # Create minimal sample data
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
                    print("Created sample dataset")
    except Exception as e:
        print(f"Database initialization error: {e}")

# Initialize database on first run
init_database()

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application

# Initialize Django WSGI application
app = get_wsgi_application()

# Export for Vercel
# Vercel expects either 'app' or 'application' as the WSGI callable
application = app
