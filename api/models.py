"""
Django models for ADRD Knowledge Graph
"""
from django.db import models
import hashlib
import secrets


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
        app_label = 'api'
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
        app_label = 'api'
        db_table = 'api_publication'
        ordering = ['-year', '-created_at']

    def __str__(self):
        return self.title


class AdminUser(models.Model):
    """Admin user model for authentication"""
    username = models.CharField(max_length=100, unique=True)
    password_hash = models.CharField(max_length=255)  # Store hashed password
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        app_label = 'api'
        db_table = 'api_adminuser'
    
    def __str__(self):
        return self.username
    
    @staticmethod
    def hash_password(password):
        """Hash password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def check_password(self, password):
        """Check if provided password matches"""
        return self.password_hash == self.hash_password(password)


class PendingUpload(models.Model):
    """Model for pending file uploads awaiting approval"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    file_name = models.CharField(max_length=500)
    file_content = models.TextField()  # Store file content as text (CSV/Excel parsed)
    file_type = models.CharField(max_length=50)  # csv, xlsx, xls
    uploaded_by = models.CharField(max_length=200, blank=True)  # Optional: email or name
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    review_notes = models.TextField(blank=True)  # Notes from reviewer
    reviewed_by = models.CharField(max_length=100, blank=True)  # Admin username
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        app_label = 'api'
        db_table = 'api_pendingupload'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.file_name} - {self.status}"

