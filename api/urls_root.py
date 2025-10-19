"""
Root URL configuration that handles both /api/* and /* paths
"""
from django.urls import path, include
from django.http import JsonResponse

def simple_health(request):
    """Simple health check that doesn't require any imports"""
    return JsonResponse({'status': 'ok', 'message': 'Django is running'})

try:
    import views
except Exception as e:
    print(f"Error importing views: {e}")
    views = None

# All the actual endpoints
if views:
    api_patterns = [
        path('health', views.health_check),
        path('health/', views.health_check),
        path('datasets', views.get_datasets),
        path('datasets/', views.get_datasets),
        path('datasets/<int:dataset_id>', views.get_dataset),
        path('datasets/<int:dataset_id>/', views.get_dataset),
        path('datasets/search', views.search_datasets),
        path('datasets/search/', views.search_datasets),
        path('datasets/export', views.export_datasets),
        path('datasets/export/', views.export_datasets),
        path('datasets/recent', views.get_recent_datasets),
        path('datasets/recent/', views.get_recent_datasets),
        path('datasets/<int:dataset_id>/publications', views.get_dataset_publications),
        path('datasets/<int:dataset_id>/publications/', views.get_dataset_publications),
        path('publications', views.get_publications),
        path('publications/', views.get_publications),
        path('publications/search', views.search_publications),
        path('publications/search/', views.search_publications),
        path('publications/export', views.export_publications),
        path('publications/export/', views.export_publications),
        path('publications/recent', views.get_recent_publications),
        path('publications/recent/', views.get_recent_publications),
        path('stats', views.get_stats),
        path('stats/', views.get_stats),
        path('filters', views.get_filters),
        path('filters/', views.get_filters),
        path('analytics/overview', views.get_analytics_overview),
        path('analytics/overview/', views.get_analytics_overview),
    ]
else:
    # Fallback if views fail to import
    api_patterns = [
        path('health', simple_health),
        path('health/', simple_health),
    ]

urlpatterns = [
    # Handle both /api/* and /* paths
    path('api/', include(api_patterns)),
    path('', include(api_patterns)),
]

