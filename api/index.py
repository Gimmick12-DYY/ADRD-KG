"""
Vercel entry point - Minimal Django without django.setup()
"""
import os
import sys
from pathlib import Path

# Add api directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Import Django and configure manually
# DO NOT set DJANGO_SETTINGS_MODULE - we'll configure directly
from django.conf import settings
from django.apps import apps

# Force settings configuration
if not settings.configured:
    settings.configure(
        DEBUG=False,  # Disable debug mode to prevent detailed error pages
        SECRET_KEY='django-insecure-vercel-key-2024',
        ALLOWED_HOSTS=['*'],
        INSTALLED_APPS=[
            'django.contrib.contenttypes',
        ],
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': '/tmp/adrd_kg.db',
                'OPTIONS': {
                    'timeout': 20,  # Wait up to 20 seconds for database lock
                },
                'CONN_MAX_AGE': 0,  # Don't persist connections (important for serverless)
            }
        },
        MIDDLEWARE=[
            'django.middleware.common.CommonMiddleware',
        ],
        ROOT_URLCONF='urls_root',
        USE_TZ=True,
        DEFAULT_AUTO_FIELD='django.db.models.BigAutoField',
        # Add logging to see actual errors
        LOGGING={
            'version': 1,
            'handlers': {
                'console': {'class': 'logging.StreamHandler'},
            },
            'root': {'handlers': ['console'], 'level': 'INFO'},
        },
    )

# Setup apps
if not apps.ready:
    apps.populate(settings.INSTALLED_APPS)

# Manually register our models with Django
try:
    import models
    from django.apps.registry import Apps
    from django.apps.config import AppConfig
    
    # Create a simple app config
    class ApiAppConfig(AppConfig):
        name = 'api'
        label = 'api'
        verbose_name = 'API'
    
    # Register the app if not already registered
    if not apps.is_installed('api'):
        api_config = ApiAppConfig('api', models)
        api_config.apps = apps  # ensure AppConfig can resolve registry lookups
        api_config.models_module = models
        apps.all_models['api'] = {}
        apps.app_configs['api'] = api_config
        
        # Register models
        apps.all_models['api']['dataset'] = models.Dataset
        apps.all_models['api']['publication'] = models.Publication
        apps.all_models['api']['pendingupload'] = models.PendingUpload
        apps.all_models['api']['adminuser'] = models.AdminUser
        
        print("✓ Models registered with Django")
except Exception as e:
    print(f"Warning: Could not register models: {e}")

# Initialize admin users
def init_admin_users():
    """Ensure initial admin users exist"""
    try:
        from models import AdminUser
        
        admin_users = [
            {'username': 'Yuyang', 'password': 'Big-s2'},
            {'username': 'Sara', 'password': 'Big-s2'},
        ]
        
        for admin_data in admin_users:
            if not AdminUser.objects.filter(username=admin_data['username']).exists():
                AdminUser.objects.create(
                    username=admin_data['username'],
                    password_hash=AdminUser.hash_password(admin_data['password'])
                )
                print(f"✓ Created admin user: {admin_data['username']}")
    except Exception as e:
        print(f"Admin user init warning: {e}")

# Initialize database
def init_database():
    """Initialize database with tables and sample data"""
    try:
        from django.core.management import execute_from_command_line
        from django.db import connection
        from models import Dataset, Publication
        
        # Ensure database file exists and is accessible
        db_path = settings.DATABASES['default']['NAME']
        import os
        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
        
        # Log database path for debugging
        db_exists = os.path.exists(db_path)
        db_size = os.path.getsize(db_path) if db_exists else 0
        print(f"Database path: {db_path}, exists: {db_exists}, size: {db_size} bytes")
        
        # Check if tables exist - check for all required tables
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_dataset';")
            dataset_table_exists = cursor.fetchone()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_pendingupload';")
            pending_table_exists = cursor.fetchone()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_adminuser';")
            admin_table_exists = cursor.fetchone()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_publication';")
            pub_table_exists = cursor.fetchone()
        
        if not dataset_table_exists or not pending_table_exists or not admin_table_exists or not pub_table_exists:
            print("Creating tables...")
            # Create tables manually
            with connection.schema_editor() as schema_editor:
                if not dataset_table_exists:
                    schema_editor.create_model(Dataset)
                    print("Created api_dataset table")
                if not pending_table_exists:
                    schema_editor.create_model(models.PendingUpload)
                    print("Created api_pendingupload table")
                if not admin_table_exists:
                    schema_editor.create_model(models.AdminUser)
                    print("Created api_adminuser table")
                if not pub_table_exists:
                    schema_editor.create_model(Publication)
                    print("Created api_publication table")
            
            # Only create sample data if database is truly empty (no existing data)
            # Use a try-except to handle cases where the connection might not be ready
            try:
                existing_datasets_count = Dataset.objects.count()
                existing_publications_count = Publication.objects.count()
                print(f"Existing data check: {existing_datasets_count} datasets, {existing_publications_count} publications")
            except Exception as count_error:
                print(f"Error checking existing data: {count_error}")
                existing_datasets_count = 0
                existing_publications_count = 0
            
            if existing_datasets_count == 0 and existing_publications_count == 0:
                print("Database is empty, creating sample data...")
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
            else:
                print(f"✓ Database already has data ({existing_datasets_count} datasets, {existing_publications_count} publications), skipping sample data creation")
        else:
            # Tables exist, check if we need to ensure admin users exist
            try:
                existing_datasets_count = Dataset.objects.count()
                existing_publications_count = Publication.objects.count()
                print(f"✓ Database tables already exist ({existing_datasets_count} datasets, {existing_publications_count} publications)")
            except Exception as e:
                print(f"Error counting existing data: {e}")
                print("✓ Database tables already exist")
        
        # Always ensure admin users exist (even if tables already existed)
        init_admin_users()
        
    except Exception as e:
        print(f"DB init warning: {e}")
        import traceback
        traceback.print_exc()

# Initialize database - but only once, use a flag to prevent multiple initializations
_db_initialized = False

def ensure_database_initialized():
    """Ensure database is initialized, but only do it once per process"""
    global _db_initialized
    if _db_initialized:
        return
    
    try:
        init_database()
        # Also ensure admin users exist (in case database was already initialized)
        init_admin_users()
        _db_initialized = True
    except Exception as e:
        print(f"DB init error: {e}")
        import traceback
        traceback.print_exc()
        # Try to initialize admin users even if database init failed
        try:
            init_admin_users()
        except:
            pass

# Initialize database on module load (only runs once per serverless function instance)
ensure_database_initialized()

# Get WSGI application
from django.core.handlers.wsgi import WSGIHandler
application = WSGIHandler()

# Export for Vercel
app = application
