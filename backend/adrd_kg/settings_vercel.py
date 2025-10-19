"""
Vercel-specific settings for ADRD Knowledge Graph Django project.
Optimized for serverless deployment with maximum compatibility.
"""

import os
from pathlib import Path
from .settings import *

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Secret key
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-vercel-temp-key-2024')

# Debug mode - enable for now to see errors
DEBUG = True

# Allow all hosts
ALLOWED_HOSTS = ['*']

# Database - SQLite in /tmp (ephemeral on Vercel)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/tmp/adrd_knowledge_graph.db',
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = '/tmp/staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = '/tmp/media/'

# CORS - Allow everything
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ['*']
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']

# CSRF - Disable for API
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False
CSRF_TRUSTED_ORIGINS = ['*']
CSRF_USE_SESSIONS = False

# Sessions
SESSION_COOKIE_AGE = 86400
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = False

# Disable some security features for testing
SECURE_SSL_REDIRECT = False
SECURE_BROWSER_XSS_FILTER = False
X_FRAME_OPTIONS = 'SAMEORIGIN'

# Cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'adrd-cache',
    }
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
}

print("✓ Vercel settings loaded - CORS enabled, DEBUG=True")
