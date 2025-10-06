# Django Migration Guide

## Overview

Your Flask application has been successfully converted to Django while maintaining all features and functionality. This guide explains the changes and how to use the new Django backend.

## What Changed

### 1. Framework Migration
- **From:** Flask + Flask-SQLAlchemy + Flask-CORS
- **To:** Django + Django REST Framework + django-cors-headers

### 2. Project Structure
```
backend/
├── manage.py                 # Django management script
├── app.py                   # Django development server runner
├── app_flask_backup.py      # Original Flask app (backup)
├── adrd_kg/                 # Django project settings
│   ├── __init__.py
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL configuration
│   ├── wsgi.py              # WSGI configuration
│   └── asgi.py              # ASGI configuration
├── api/                     # Django app for API
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py            # Django models (converted from Flask)
│   ├── views.py             # Django views (converted from Flask routes)
│   ├── urls.py              # API URL routing
│   ├── admin.py             # Django admin configuration
│   └── management/
│       └── commands/
│           └── load_sample_data.py  # Data loading command
└── instance/
    └── adrd_knowledge_graph.db     # SQLite database (same as before)
```

### 3. API Endpoints (Unchanged)
All API endpoints remain exactly the same:

- `GET /api/health` - Health check
- `GET /api/datasets` - Get datasets with filtering
- `GET /api/datasets/{id}` - Get specific dataset
- `GET /api/publications` - Get publications with filtering
- `GET /api/stats` - Get summary statistics
- `GET /api/filters` - Get available filter options
- `GET /api/datasets/search` - Advanced dataset search
- `GET /api/publications/search` - Advanced publication search
- `GET /api/datasets/export` - Export datasets to CSV
- `GET /api/publications/export` - Export publications to CSV
- `GET /api/datasets/{id}/publications` - Get publications for dataset
- `GET /api/analytics/overview` - Comprehensive analytics
- `GET /api/datasets/recent` - Recent datasets
- `GET /api/publications/recent` - Recent publications

## How to Run

### Option 1: Use the Startup Script (Recommended)
```bash
./start.sh
```

### Option 2: Manual Setup
```bash
# Backend (Django)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
python app.py

# Frontend (in another terminal)
cd frontend
npm run dev
```

### Option 3: Django Management Commands
```bash
cd backend
source venv/bin/activate

# Run migrations
python manage.py migrate

# Load sample data
python manage.py load_sample_data

# Start development server
python manage.py runserver 0.0.0.0:5000
```

## Key Differences

### 1. Models
- **Flask:** SQLAlchemy models with `db.Model`
- **Django:** Django models with `models.Model`
- **Result:** Same database structure, different syntax

### 2. Views
- **Flask:** Function-based routes with `@app.route()`
- **Django:** Function-based views with URL patterns
- **Result:** Same API responses, different implementation

### 3. Database Queries
- **Flask:** SQLAlchemy query syntax
- **Django:** Django ORM query syntax
- **Result:** Same functionality, more Django-idiomatic code

### 4. Configuration
- **Flask:** Direct configuration in app.py
- **Django:** settings.py with proper Django structure
- **Result:** Better organization and Django best practices

## Benefits of Django Migration

1. **Better Structure:** Django's app-based architecture
2. **Admin Interface:** Built-in admin panel at `/admin/`
3. **Management Commands:** Easy data loading and maintenance
4. **Better ORM:** More powerful and intuitive database operations
5. **Security:** Django's built-in security features
6. **Scalability:** Better suited for larger applications
7. **Ecosystem:** Rich ecosystem of Django packages

## Admin Interface

Django provides a built-in admin interface:

1. Start the server: `python manage.py runserver`
2. Visit: `http://localhost:5000/admin/`
3. Create a superuser: `python manage.py createsuperuser`
4. Login and manage your data through the web interface

## Database Management

### View Data
```bash
# Django shell
python manage.py shell

# In the shell:
from api.models import Dataset, Publication
Dataset.objects.all()
Publication.objects.all()
```

### Reset Database
```bash
# Delete database
rm instance/adrd_knowledge_graph.db

# Recreate and migrate
python manage.py migrate

# Load sample data
python manage.py load_sample_data
```

## Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn adrd_kg.wsgi:application --bind 0.0.0.0:5000
```

### Using Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "adrd_kg.wsgi:application", "--bind", "0.0.0.0:5000"]
```

## Troubleshooting

### Common Issues

1. **Import Errors:** Make sure you're in the virtual environment
2. **Database Issues:** Run `python manage.py migrate`
3. **CORS Issues:** Check `CORS_ALLOWED_ORIGINS` in settings.py
4. **Port Conflicts:** Django runs on port 5000 by default

### Debug Mode
Django's debug mode provides detailed error pages. Set `DEBUG = True` in settings.py for development.

## Migration Complete! ✅

Your Flask application has been successfully converted to Django with:
- ✅ All API endpoints preserved
- ✅ Same database structure
- ✅ Same functionality
- ✅ Better code organization
- ✅ Django admin interface
- ✅ Management commands
- ✅ Production-ready structure

The frontend will work exactly the same - no changes needed!
