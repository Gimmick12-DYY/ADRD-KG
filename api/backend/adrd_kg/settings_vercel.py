"""
Vercel-specific settings for ADRD Knowledge Graph Django project.
"""

import os
from pathlib import Path
from .settings import *

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'vercel-development-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True  # Temporarily enable for testing

# Vercel deployment settings
ALLOWED_HOSTS = ['*']  # Allow all hosts temporarily for debugging

# Add custom domain if provided
CUSTOM_DOMAIN = os.environ.get('CUSTOM_DOMAIN')
if CUSTOM_DOMAIN:
    ALLOWED_HOSTS.extend([CUSTOM_DOMAIN, f'www.{CUSTOM_DOMAIN}'])

# Database - Use PostgreSQL for production, SQLite for development
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    # Use external PostgreSQL (recommended for production)
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    # Use SQLite for development/testing
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': '/tmp/adrd_knowledge_graph.db',  # Vercel tmp directory
        }
    }

# Static files configuration for Vercel
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Since Vercel doesn't support persistent file storage, 
# we'll serve static files through Django in development
# For production, use a CDN or external storage
if not DEBUG:
    # Use WhiteNoise for static files in production
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files - Use external storage for production
MEDIA_URL = '/media/'
MEDIA_ROOT = '/tmp/media/'  # Temporary directory on Vercel

# CORS settings for Vercel
# Allow all origins for now - can be restricted later
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# If you want to restrict origins in production, use regex patterns:
# CORS_ALLOWED_ORIGIN_REGEXES = [
#     r"^https://.*\.vercel\.app$",
#     r"^https://.*\.now\.sh$",
# ]

# Security settings for production
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # HTTPS settings (Vercel provides HTTPS by default)
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Session configuration
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# CSRF settings - Disable for API endpoints
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read CSRF token
CSRF_COOKIE_SAMESITE = 'Lax'
# Exempt API views from CSRF (they're read-only GET endpoints)
CSRF_COOKIE_SECURE = not DEBUG
# Add your Vercel domain to trusted origins
CSRF_TRUSTED_ORIGINS = []
if not DEBUG:
    CSRF_TRUSTED_ORIGINS = [
        'https://adrd-knowledge-graph-git-main-yuyang-dengs-projects.vercel.app',
        'https://adrd-knowledge-graph-mizelh4ig-yuyang-dengs-projects.vercel.app',
    ]

# Disable Django's built-in static file serving in production
if not DEBUG:
    STATICFILES_DIRS = []

# Logging configuration for Vercel
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
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
        'api': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Cache configuration - Use in-memory cache for Vercel
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'adrd-kg-cache',
    }
}

# Email configuration (optional)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
if not DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

# Django REST Framework settings for Vercel
REST_FRAMEWORK.update({
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
    },
})

# File upload settings (limited on Vercel)
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB

print(f"Vercel settings loaded. DEBUG={DEBUG}, Database={'PostgreSQL' if DATABASE_URL else 'SQLite'}")
