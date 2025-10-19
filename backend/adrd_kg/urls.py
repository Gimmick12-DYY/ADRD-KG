"""
URL configuration for adrd_kg project.
Configured for Vercel serverless deployment.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Handle both /api/* and /* paths (Vercel may or may not strip /api/)
    path('api/', include('api.urls')),
    path('', include('api.urls')),
]
