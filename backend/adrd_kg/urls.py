"""
URL configuration for adrd_kg project.
Configured for Vercel serverless deployment.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Mount all API routes at root since Vercel routes /api/* to this function
    path('', include('api.urls')),
]
