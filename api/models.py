"""
Django models for ADRD Knowledge Graph
"""
from django.db import models


class Dataset(models.Model):
    """Dataset model for ADRD research datasets"""
    name = models.CharField(max_length=500)
    description = models.TextField()
    disease_type = models.CharField(max_length=200)
    sample_size = models.IntegerField()
    data_accessibility = models.CharField(max_length=200)
    wgs_available = models.CharField(max_length=50)
    imaging_types = models.TextField()
    modalities = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_dataset'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Publication(models.Model):
    """Publication model for research publications"""
    title = models.CharField(max_length=1000)
    authors = models.TextField()
    journal = models.CharField(max_length=500)
    year = models.IntegerField()
    pmid = models.CharField(max_length=50)
    doi = models.CharField(max_length=200)
    dataset_name = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_publication'
        ordering = ['-year', '-created_at']

    def __str__(self):
        return self.title

