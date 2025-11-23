"""
Django settings for ADRD Knowledge Graph API
Minimal configuration for Vercel serverless deployment
"""
import os

# Build paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Security settings
SECRET_KEY = 'django-insecure-vercel-deployment-key-2024'
DEBUG = True
ALLOWED_HOSTS = ['*']

# Application definition - Minimal apps only
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# CORS settings - Allow all
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ['*']
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

ROOT_URLCONF = 'api.urls_root'

# Templates - minimal configuration
TEMPLATES = []

# Database - SQLite in /tmp for Vercel
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/tmp/adrd_kg.db',
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = '/tmp/static'

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = False
USE_TZ = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Disable logging configuration to avoid module errors
LOGGING_CONFIG = None

print("[OK] Django settings loaded for Vercel")
