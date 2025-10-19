"""
URL routing for ADRD Knowledge Graph API
"""
from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health', views.health_check),
    path('health/', views.health_check),
    
    # Datasets
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
    
    # Publications
    path('publications', views.get_publications),
    path('publications/', views.get_publications),
    path('publications/search', views.search_publications),
    path('publications/search/', views.search_publications),
    path('publications/export', views.export_publications),
    path('publications/export/', views.export_publications),
    path('publications/recent', views.get_recent_publications),
    path('publications/recent/', views.get_recent_publications),
    
    # Statistics and analytics
    path('stats', views.get_stats),
    path('stats/', views.get_stats),
    path('filters', views.get_filters),
    path('filters/', views.get_filters),
    path('analytics/overview', views.get_analytics_overview),
    path('analytics/overview/', views.get_analytics_overview),
]

