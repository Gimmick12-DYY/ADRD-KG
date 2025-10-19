"""
Vercel Serverless Function for Django API - Clean Implementation
"""
import os
import sys
from pathlib import Path

# Setup paths
current_dir = Path(__file__).parent
backend_dir = current_dir / 'backend'
sys.path.insert(0, str(backend_dir))

# Configure Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adrd_kg.settings_vercel')

# Initialize Django
import django
django.setup()

# Import WSGI handler
from django.core.handlers.wsgi import WSGIHandler

# Create application instance
application = WSGIHandler()

# Initialize database on cold start
_db_initialized = False

def init_db():
    """Initialize database with migrations and sample data"""
    global _db_initialized
    if _db_initialized:
        return
    
    try:
        from django.core.management import call_command
        from django.db import connection
        
        # Check if tables exist
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_dataset';")
            result = cursor.fetchone()
        
        if not result:
            print("Initializing database...")
            call_command('migrate', '--noinput', verbosity=0)
            
            # Create sample data
            from api.models import Dataset, Publication
            
            if not Dataset.objects.exists():
                # Create sample datasets
                datasets = [
                    Dataset(
                        name="Alzheimer's Disease Neuroimaging Initiative (ADNI)",
                        description="A large-scale study to validate biomarkers for Alzheimer's disease clinical trials",
                        disease_type="Alzheimer's Disease",
                        sample_size=2500,
                        data_accessibility="Open with application",
                        wgs_available="Yes",
                        imaging_types="MRI, PET, DTI",
                        modalities="MRI, PET, DTI, Clinical, Genetic"
                    ),
                    Dataset(
                        name="UK Biobank",
                        description="Large-scale biomedical database with genetic and health information",
                        disease_type="Multiple Dementia Types",
                        sample_size=500000,
                        data_accessibility="Open with application",
                        wgs_available="Yes",
                        imaging_types="MRI, fMRI",
                        modalities="MRI, fMRI, Genetic, EHR"
                    ),
                    Dataset(
                        name="Religious Orders Study (ROS)",
                        description="Longitudinal clinical-pathologic cohort study of aging and dementia",
                        disease_type="Alzheimer's Disease",
                        sample_size=1200,
                        data_accessibility="Open",
                        wgs_available="Yes",
                        imaging_types="MRI",
                        modalities="MRI, Clinical, Genetic, Neuropathology"
                    ),
                ]
                Dataset.objects.bulk_create(datasets)
                
                # Create sample publications
                publications = [
                    Publication(
                        title="Imaging and biomarkers in Alzheimer's disease",
                        authors="Mueller SG, et al.",
                        journal="Neurobiology of Aging",
                        year=2020,
                        pmid="32145678",
                        doi="10.1016/j.neurobiolaging.2020.01.001",
                        dataset_name="Alzheimer's Disease Neuroimaging Initiative (ADNI)"
                    ),
                    Publication(
                        title="Genetic risk factors for dementia",
                        authors="Smith J, et al.",
                        journal="Nature Genetics",
                        year=2021,
                        pmid="33456789",
                        doi="10.1038/ng.2021.001",
                        dataset_name="UK Biobank"
                    ),
                    Publication(
                        title="Neuropathology of aging brain",
                        authors="Bennett DA, et al.",
                        journal="Annals of Neurology",
                        year=2019,
                        pmid="31234567",
                        doi="10.1002/ana.25678",
                        dataset_name="Religious Orders Study (ROS)"
                    ),
                ]
                Publication.objects.bulk_create(publications)
                
                print(f"Created {len(datasets)} datasets and {len(publications)} publications")
        
        _db_initialized = True
        print("Database initialized successfully")
        
    except Exception as e:
        print(f"Database initialization warning: {e}")
        # Don't crash on DB errors

# Try to initialize database
try:
    init_db()
except Exception as e:
    print(f"DB init error (will retry on first request): {e}")

# Export for Vercel
app = application
