"""
Vercel entry point - Minimal Django without django.setup()
"""
import os
import sys
from pathlib import Path

# Add api directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Manually configure Django settings without calling setup()
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

# Import Django and configure manually
from django.conf import settings
from django.apps import apps

# Force settings configuration
if not settings.configured:
    settings.configure(
        DEBUG=True,
        SECRET_KEY='django-insecure-vercel-key-2024',
        ALLOWED_HOSTS=['*'],
        INSTALLED_APPS=[
            'django.contrib.contenttypes',
        ],
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': '/tmp/adrd_kg.db',
            }
        },
        MIDDLEWARE=[],
        ROOT_URLCONF='urls_root',
        USE_TZ=True,
        DEFAULT_AUTO_FIELD='django.db.models.BigAutoField',
    )

# Setup apps
if not apps.ready:
    apps.populate(settings.INSTALLED_APPS)

# Initialize database
def init_database():
    """Initialize database with tables and sample data"""
    try:
        from django.core.management import execute_from_command_line
        from django.db import connection
        from models import Dataset, Publication
        
        # Check if tables exist
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_dataset';")
            table_exists = cursor.fetchone()
        
        if not table_exists:
            print("Creating tables...")
            # Create tables manually
            with connection.schema_editor() as schema_editor:
                schema_editor.create_model(Dataset)
                schema_editor.create_model(Publication)
            
            # Create sample data
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
        print(f"DB init warning: {e}")

# Initialize database
try:
    init_database()
except Exception as e:
    print(f"DB init error: {e}")

# Get WSGI application
from django.core.handlers.wsgi import WSGIHandler
application = WSGIHandler()

# Export for Vercel
app = application
