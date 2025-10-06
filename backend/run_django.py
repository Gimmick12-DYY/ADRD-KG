#!/usr/bin/env python
"""
Django development server runner
This replaces the Flask app.py for Django development
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adrd_kg.settings')
    django.setup()
    
    # Run migrations
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Load sample data
    execute_from_command_line(['manage.py', 'load_sample_data'])
    
    # Start development server
    execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:5000'])
