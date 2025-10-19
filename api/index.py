"""
Vercel entry point for Django API
"""
import os
import sys
from pathlib import Path

# Add api directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

# Initialize Django
import django
django.setup()

# Create tables and load sample data
def init_database():
    """Initialize database with tables and sample data"""
    from django.core.management import call_command
    from django.db import connection
    from api.models import Dataset, Publication
    
    try:
        # Check if tables exist
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_dataset';")
            table_exists = cursor.fetchone()
        
        if not table_exists:
            print("Creating database tables...")
            call_command('migrate', '--run-syncdb', verbosity=0)
            
            # Create sample data
            if not Dataset.objects.exists():
                print("Loading sample data...")
                
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
                
                print(f"✓ Created {len(datasets)} datasets and {len(publications)} publications")
    except Exception as e:
        print(f"Database init warning: {e}")

# Initialize database
init_database()

# Get WSGI application
from django.core.handlers.wsgi import WSGIHandler
application = WSGIHandler()

# Export for Vercel
app = application

