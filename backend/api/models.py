from django.db import models
from django.utils import timezone


class Dataset(models.Model):
    """Dataset model for ADRD research datasets"""
    name = models.CharField(max_length=200, unique=True, null=False, blank=False)
    description = models.TextField(blank=True, null=True)
    disease_type = models.CharField(max_length=100, blank=True, null=True)
    sample_size = models.IntegerField(blank=True, null=True)
    data_accessibility = models.CharField(max_length=100, blank=True, null=True)
    wgs_available = models.CharField(max_length=50, blank=True, null=True)
    imaging_types = models.CharField(max_length=500, blank=True, null=True)
    modalities = models.TextField(blank=True, null=True)  # JSON string of available modalities
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Publication(models.Model):
    """Publication model for research publications"""
    title = models.CharField(max_length=500, null=False, blank=False)
    authors = models.TextField(blank=True, null=True)
    journal = models.CharField(max_length=200, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    pmid = models.CharField(max_length=20, blank=True, null=True)
    doi = models.CharField(max_length=100, blank=True, null=True)
    dataset_name = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-year', '-created_at']

    def __str__(self):
        return self.title
