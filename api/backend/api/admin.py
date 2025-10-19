from django.contrib import admin
from .models import Dataset, Publication


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ('name', 'disease_type', 'sample_size', 'data_accessibility', 'created_at')
    list_filter = ('disease_type', 'data_accessibility', 'created_at')
    search_fields = ('name', 'description', 'disease_type')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ('title', 'journal', 'year', 'dataset_name', 'created_at')
    list_filter = ('year', 'journal', 'dataset_name', 'created_at')
    search_fields = ('title', 'authors', 'journal', 'dataset_name')
    readonly_fields = ('created_at',)
    ordering = ('-year', '-created_at')
