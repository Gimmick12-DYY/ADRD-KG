from django.urls import path
from . import views

urlpatterns = [
    # Health check - handle both with and without trailing slash
    path('health', views.health_check, name='health_check'),
    path('health/', views.health_check, name='health_check_slash'),
    
    # Dataset endpoints - handle both with and without trailing slash
    path('datasets', views.get_datasets, name='get_datasets'),
    path('datasets/', views.get_datasets, name='get_datasets_slash'),
    path('datasets/<int:dataset_id>', views.get_dataset, name='get_dataset'),
    path('datasets/<int:dataset_id>/', views.get_dataset, name='get_dataset_slash'),
    path('datasets/search', views.search_datasets, name='search_datasets'),
    path('datasets/search/', views.search_datasets, name='search_datasets_slash'),
    path('datasets/export', views.export_datasets, name='export_datasets'),
    path('datasets/export/', views.export_datasets, name='export_datasets_slash'),
    path('datasets/recent', views.get_recent_datasets, name='get_recent_datasets'),
    path('datasets/recent/', views.get_recent_datasets, name='get_recent_datasets_slash'),
    path('datasets/<int:dataset_id>/publications', views.get_dataset_publications, name='get_dataset_publications'),
    path('datasets/<int:dataset_id>/publications/', views.get_dataset_publications, name='get_dataset_publications_slash'),
    
    # Publication endpoints - handle both with and without trailing slash
    path('publications', views.get_publications, name='get_publications'),
    path('publications/', views.get_publications, name='get_publications_slash'),
    path('publications/search', views.search_publications, name='search_publications'),
    path('publications/search/', views.search_publications, name='search_publications_slash'),
    path('publications/export', views.export_publications, name='export_publications'),
    path('publications/export/', views.export_publications, name='export_publications_slash'),
    path('publications/recent', views.get_recent_publications, name='get_recent_publications'),
    path('publications/recent/', views.get_recent_publications, name='get_recent_publications_slash'),
    
    # Statistics and analytics - handle both with and without trailing slash
    path('stats', views.get_stats, name='get_stats'),
    path('stats/', views.get_stats, name='get_stats_slash'),
    path('filters', views.get_filters, name='get_filters'),
    path('filters/', views.get_filters, name='get_filters_slash'),
    path('analytics/overview', views.get_analytics_overview, name='get_analytics_overview'),
    path('analytics/overview/', views.get_analytics_overview, name='get_analytics_overview_slash'),
]
