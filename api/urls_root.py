"""
Root URL configuration that handles both /api/* and /* paths
"""
from django.urls import path, include
from django.http import JsonResponse
import sys
import traceback

def simple_health(request):
    """Simple health check that doesn't require any imports"""
    return JsonResponse({'status': 'ok', 'message': 'Django is running on Vercel'})

# Try to import views and models
views_module = None
models_module = None
import_errors = []

try:
    import models as models_module
    print(f"✓ Models imported successfully")
except Exception as e:
    error_msg = f"Error importing models: {str(e)}\n{traceback.format_exc()}"
    print(error_msg)
    import_errors.append(error_msg)

try:
    import views as views_module
    print(f"✓ Views imported successfully")
except Exception as e:
    error_msg = f"Error importing views: {str(e)}\n{traceback.format_exc()}"
    print(error_msg)
    import_errors.append(error_msg)

# Debug endpoint to show import status
def debug_status(request):
    """Show import status and errors"""
    return JsonResponse({
        'status': 'running',
        'models_imported': models_module is not None,
        'views_imported': views_module is not None,
        'errors': import_errors if import_errors else None,
        'python_version': sys.version,
        'python_path': sys.path[:5]  # First 5 paths only
    })

# Build URL patterns based on what imported successfully
api_patterns = [
    path('health', simple_health),
    path('health/', simple_health),
    path('debug', debug_status),
    path('debug/', debug_status),
]

# Add full API patterns if views imported successfully
if views_module:
    try:
        # Verify key functions exist
        if hasattr(views_module, 'approve_upload') and hasattr(views_module, 'reject_upload'):
            print(f"✓ approve_upload and reject_upload functions found")
        else:
            print(f"⚠ approve_upload or reject_upload not found in views_module")
            print(f"Available functions: {[attr for attr in dir(views_module) if not attr.startswith('_')]}")
        
        api_patterns.extend([
            path('datasets', views_module.get_datasets),
            path('datasets/', views_module.get_datasets),
            path('datasets/<int:dataset_id>', views_module.get_dataset),
            path('datasets/<int:dataset_id>/', views_module.get_dataset),
            path('datasets/search', views_module.search_datasets),
            path('datasets/search/', views_module.search_datasets),
            path('datasets/export', views_module.export_datasets),
            path('datasets/export/', views_module.export_datasets),
            path('datasets/recent', views_module.get_recent_datasets),
            path('datasets/recent/', views_module.get_recent_datasets),
            path('datasets/<int:dataset_id>/publications', views_module.get_dataset_publications),
            path('datasets/<int:dataset_id>/publications/', views_module.get_dataset_publications),
            path('publications', views_module.get_publications),
            path('publications/', views_module.get_publications),
            path('publications/search', views_module.search_publications),
            path('publications/search/', views_module.search_publications),
            path('publications/export', views_module.export_publications),
            path('publications/export/', views_module.export_publications),
            path('publications/recent', views_module.get_recent_publications),
            path('publications/recent/', views_module.get_recent_publications),
            path('stats', views_module.get_stats),
            path('stats/', views_module.get_stats),
            path('filters', views_module.get_filters),
            path('filters/', views_module.get_filters),
            path('analytics/overview', views_module.get_analytics_overview),
            path('analytics/overview/', views_module.get_analytics_overview),
            # Authentication
            path('auth/login', views_module.admin_login),
            path('auth/login/', views_module.admin_login),
            path('auth/logout', views_module.admin_logout),
            path('auth/logout/', views_module.admin_logout),
            path('auth/check', views_module.check_auth),
            path('auth/check/', views_module.check_auth),
            # File upload
            path('upload', views_module.upload_file),
            path('upload/', views_module.upload_file),
            # Management - More specific routes first!
            path('management/pending/<int:upload_id>/approve', views_module.approve_upload),
            path('management/pending/<int:upload_id>/approve/', views_module.approve_upload),
            path('management/pending/<int:upload_id>/reject', views_module.reject_upload),
            path('management/pending/<int:upload_id>/reject/', views_module.reject_upload),
            path('management/pending/<int:upload_id>', views_module.get_pending_upload_detail),
            path('management/pending/<int:upload_id>/', views_module.get_pending_upload_detail),
            path('management/pending', views_module.get_pending_uploads),
            path('management/pending/', views_module.get_pending_uploads),
        ])
        print(f"✓ Full API patterns loaded (including auth and management)")
    except Exception as e:
        print(f"⚠ Error adding API patterns: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"⚠ Using minimal API (views import failed)")

urlpatterns = [
    # Handle both /api/* and /* paths
    path('api/', include(api_patterns)),
    path('', include(api_patterns)),
]
