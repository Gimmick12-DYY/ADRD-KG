"""
Django views for ADRD Knowledge Graph API
"""
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
import csv
import json
import base64
import pandas as pd
import io
import models
Dataset = models.Dataset
Publication = models.Publication
PendingUpload = models.PendingUpload
AdminUser = models.AdminUser


@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'ADRD Knowledge Graph API is running'
    })


@require_http_methods(["GET"])
def get_datasets(request):
    """Get all datasets with optional filtering"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        disease_type = request.GET.get('disease_type')
        modality = request.GET.get('modality')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 10))
        
        queryset = Dataset.objects.all()
        
        if disease_type:
            queryset = queryset.filter(disease_type__icontains=disease_type)
        if modality:
            queryset = queryset.filter(modalities__icontains=modality)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        paginator = Paginator(queryset, per_page)
        datasets_page = paginator.get_page(page)
        
        # Convert to list to ensure data is fetched before closing connection
        datasets_list = [{
            'id': d.id,
            'name': d.name,
            'description': d.description,
            'disease_type': d.disease_type,
            'sample_size': d.sample_size,
            'data_accessibility': d.data_accessibility,
            'wgs_available': d.wgs_available,
            'imaging_types': d.imaging_types,
            'modalities': d.modalities,
            'created_at': d.created_at.isoformat() if d.created_at else None
        } for d in datasets_page]
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'datasets': datasets_list,
            'total': paginator.count,
            'pages': paginator.num_pages,
            'current_page': page
        })
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_dataset(request, dataset_id):
    """Get a specific dataset by ID"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        dataset = Dataset.objects.get(id=dataset_id)
        
        result = {
            'id': dataset.id,
            'name': dataset.name,
            'description': dataset.description,
            'disease_type': dataset.disease_type,
            'sample_size': dataset.sample_size,
            'data_accessibility': dataset.data_accessibility,
            'wgs_available': dataset.wgs_available,
            'imaging_types': dataset.imaging_types,
            'modalities': dataset.modalities,
            'created_at': dataset.created_at.isoformat() if dataset.created_at else None
        }
        
        # Close connection after use
        connection.close()
        
        return JsonResponse(result)
    except Dataset.DoesNotExist:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': 'Dataset not found'}, status=404)
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_publications(request):
    """Get all publications with optional filtering"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        dataset_name = request.GET.get('dataset_name')
        title_search = request.GET.get('title_search')
        year = request.GET.get('year')
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 10))
        
        queryset = Publication.objects.all()
        
        if dataset_name:
            queryset = queryset.filter(dataset_name__icontains=dataset_name)
        if title_search:
            queryset = queryset.filter(title__icontains=title_search)
        if year:
            queryset = queryset.filter(year=int(year))
        
        paginator = Paginator(queryset, per_page)
        publications_page = paginator.get_page(page)
        
        # Convert to list to ensure data is fetched before closing connection
        publications_list = [{
            'id': p.id,
            'title': p.title,
            'authors': p.authors,
            'journal': p.journal,
            'year': p.year,
            'pmid': p.pmid,
            'doi': p.doi,
            'dataset_name': p.dataset_name,
            'created_at': p.created_at.isoformat() if p.created_at else None
        } for p in publications_page]
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'publications': publications_list,
            'total': paginator.count,
            'pages': paginator.num_pages,
            'current_page': page
        })
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_stats(request):
    """Get summary statistics"""
    from django.db import connection, close_old_connections
    from django.db.models import Count
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        total_datasets = Dataset.objects.count()
        total_publications = Publication.objects.count()
        
        disease_stats = list(Dataset.objects.values('disease_type').annotate(
            count=Count('id')
        ).filter(disease_type__isnull=False))
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'total_datasets': total_datasets,
            'total_publications': total_publications,
            'disease_distribution': [
                {'disease_type': stat['disease_type'], 'count': stat['count']}
                for stat in disease_stats
            ]
        })
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_filters(request):
    """Get available filter options"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        disease_types = list(Dataset.objects.values_list('disease_type', flat=True).distinct())
        disease_types = [d for d in disease_types if d]
        
        modalities = [
            "MRI", "fMRI", "PET", "DTI", "ASL",
            "SNP Genotyping", "WGS", "WES", "RNA", "Epigenomics",
            "Proteomics", "Metabolomics", "EHR", "Clinical Cognitive Tests"
        ]
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'disease_types': sorted(disease_types),
            'modalities': sorted(modalities)
        })
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def search_datasets(request):
    """Advanced search for datasets"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        query = request.GET.get('q', '')
        disease_type = request.GET.get('disease_type')
        modality = request.GET.get('modality')
        min_sample_size = request.GET.get('min_sample_size')
        max_sample_size = request.GET.get('max_sample_size')
        data_access = request.GET.get('data_accessibility')
        wgs_available = request.GET.get('wgs_available')
        
        search_query = Dataset.objects.all()
        
        if query:
            search_query = search_query.filter(
                Q(name__icontains=query) | Q(description__icontains=query)
            )
        if disease_type:
            search_query = search_query.filter(disease_type__icontains=disease_type)
        if modality:
            search_query = search_query.filter(modalities__icontains=modality)
        if min_sample_size:
            search_query = search_query.filter(sample_size__gte=int(min_sample_size))
        if max_sample_size:
            search_query = search_query.filter(sample_size__lte=int(max_sample_size))
        if data_access:
            search_query = search_query.filter(data_accessibility__icontains=data_access)
        if wgs_available:
            search_query = search_query.filter(wgs_available__icontains=wgs_available)
        
        datasets = list(search_query.all())
        
        datasets_list = [{
            'id': d.id,
            'name': d.name,
            'description': d.description,
            'disease_type': d.disease_type,
            'sample_size': d.sample_size,
            'data_accessibility': d.data_accessibility,
            'wgs_available': d.wgs_available,
            'imaging_types': d.imaging_types,
            'modalities': d.modalities,
            'created_at': d.created_at.isoformat() if d.created_at else None
        } for d in datasets]
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'datasets': datasets_list,
            'total': len(datasets_list)
        })
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def search_publications(request):
    """Advanced search for publications"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        query = request.GET.get('q', '')
        dataset_name = request.GET.get('dataset_name')
        journal = request.GET.get('journal')
        min_year = request.GET.get('min_year')
        max_year = request.GET.get('max_year')
        author = request.GET.get('author')
        
        search_query = Publication.objects.all()
        
        if query:
            search_query = search_query.filter(
                Q(title__icontains=query) | Q(authors__icontains=query)
            )
        if dataset_name:
            search_query = search_query.filter(dataset_name__icontains=dataset_name)
        if journal:
            search_query = search_query.filter(journal__icontains=journal)
        if min_year:
            search_query = search_query.filter(year__gte=int(min_year))
        if max_year:
            search_query = search_query.filter(year__lte=int(max_year))
        if author:
            search_query = search_query.filter(authors__icontains=author)
        
        publications = list(search_query.all())
        
        publications_list = [{
            'id': p.id,
            'title': p.title,
            'authors': p.authors,
            'journal': p.journal,
            'year': p.year,
            'pmid': p.pmid,
            'doi': p.doi,
            'dataset_name': p.dataset_name,
            'created_at': p.created_at.isoformat() if p.created_at else None
        } for p in publications]
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'publications': publications_list,
            'total': len(publications_list)
        })
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def export_datasets(request):
    """Export datasets to CSV"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        datasets = list(Dataset.objects.all())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="adrd_datasets.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Name', 'Description', 'Disease Type', 'Sample Size',
            'Data Accessibility', 'WGS Available', 'Imaging Types',
            'Modalities', 'Created At'
        ])
        
        for d in datasets:
            writer.writerow([
                d.id, d.name, d.description, d.disease_type, d.sample_size,
                d.data_accessibility, d.wgs_available, d.imaging_types,
                d.modalities, d.created_at.isoformat() if d.created_at else None
            ])
        
        # Close connection after use
        connection.close()
        
        return response
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def export_publications(request):
    """Export publications to CSV"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        publications = list(Publication.objects.all())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="adrd_publications.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Title', 'Authors', 'Journal', 'Year',
            'PMID', 'DOI', 'Dataset Name', 'Created At'
        ])
        
        for p in publications:
            writer.writerow([
                p.id, p.title, p.authors, p.journal, p.year,
                p.pmid, p.doi, p.dataset_name, p.created_at.isoformat() if p.created_at else None
            ])
        
        # Close connection after use
        connection.close()
        
        return response
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_dataset_publications(request, dataset_id):
    """Get publications for a specific dataset"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        dataset = Dataset.objects.get(id=dataset_id)
        publications = list(Publication.objects.filter(dataset_name=dataset.name))
        
        publications_list = [{
            'id': p.id,
            'title': p.title,
            'authors': p.authors,
            'journal': p.journal,
            'year': p.year,
            'pmid': p.pmid,
            'doi': p.doi
        } for p in publications]
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'dataset': {
                'id': dataset.id,
                'name': dataset.name,
                'description': dataset.description
            },
            'publications': publications_list,
            'total': len(publications_list)
        })
    except Dataset.DoesNotExist:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': 'Dataset not found'}, status=404)
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_analytics_overview(request):
    """Get comprehensive analytics overview"""
    from django.db import connection, close_old_connections
    from django.db.models import Count
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        total_datasets = Dataset.objects.count()
        total_publications = Publication.objects.count()
        
        disease_stats = list(Dataset.objects.values('disease_type').annotate(
            count=Count('id')
        ).filter(disease_type__isnull=False))
        
        sample_sizes = list(Dataset.objects.filter(sample_size__isnull=False).values_list('sample_size', flat=True))
        sample_sizes = [s for s in sample_sizes if s]
        
        year_stats = list(Publication.objects.values('year').annotate(
            count=Count('id')
        ).filter(year__isnull=False).order_by('-year'))
        
        access_stats = list(Dataset.objects.values('data_accessibility').annotate(
            count=Count('id')
        ).filter(data_accessibility__isnull=False))
        
        wgs_stats = list(Dataset.objects.values('wgs_available').annotate(
            count=Count('id')
        ).filter(wgs_available__isnull=False))
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'overview': {
                'total_datasets': total_datasets,
                'total_publications': total_publications,
                'avg_sample_size': sum(sample_sizes) / len(sample_sizes) if sample_sizes else 0,
                'min_sample_size': min(sample_sizes) if sample_sizes else 0,
                'max_sample_size': max(sample_sizes) if sample_sizes else 0
            },
            'disease_distribution': [
                {'disease_type': stat['disease_type'], 'count': stat['count']}
                for stat in disease_stats
            ],
            'publication_years': [
                {'year': stat['year'], 'count': stat['count']}
                for stat in year_stats
            ],
            'data_accessibility': [
                {'accessibility': stat['data_accessibility'], 'count': stat['count']}
                for stat in access_stats
            ],
            'wgs_availability': [
                {'availability': stat['wgs_available'], 'count': stat['count']}
                for stat in wgs_stats
            ]
        })
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_recent_datasets(request):
    """Get recently added datasets"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        limit = int(request.GET.get('limit', 5))
        datasets = list(Dataset.objects.order_by('-created_at')[:limit])
        
        datasets_list = [{
            'id': d.id,
            'name': d.name,
            'description': d.description,
            'disease_type': d.disease_type,
            'sample_size': d.sample_size,
            'created_at': d.created_at.isoformat() if d.created_at else None
        } for d in datasets]
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'datasets': datasets_list
        })
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_recent_publications(request):
    """Get recently added publications"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        limit = int(request.GET.get('limit', 5))
        publications = list(Publication.objects.order_by('-created_at')[:limit])
        
        publications_list = [{
            'id': p.id,
            'title': p.title,
            'authors': p.authors,
            'journal': p.journal,
            'year': p.year,
            'dataset_name': p.dataset_name,
            'created_at': p.created_at.isoformat() if p.created_at else None
        } for p in publications]
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'publications': publications_list
        })
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


# Authentication endpoints
@csrf_exempt
@require_http_methods(["POST"])
def admin_login(request):
    """Admin login endpoint"""
    try:
        # Decode request body (Django request.body is always bytes)
        body = request.body.decode('utf-8') if isinstance(request.body, bytes) else request.body
        data = json.loads(body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({'error': 'Username and password required'}, status=400)
        
        try:
            admin = AdminUser.objects.get(username=username)
            if admin.check_password(password):
                admin.last_login = timezone.now()
                admin.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                    'username': admin.username
                })
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except AdminUser.DoesNotExist:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["POST"])
def admin_logout(request):
    """Admin logout endpoint"""
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})


@require_http_methods(["GET"])
def check_auth(request):
    """Check if user is authenticated (simple check for now)"""
    # In a real app, you'd check session/token here
    # For simplicity, we'll just return a basic response
    return JsonResponse({'authenticated': False})


# Management endpoints
@csrf_exempt
@require_http_methods(["GET"])
def get_pending_uploads(request):
    """Get all pending uploads (or all uploads if status='all')"""
    from django.db import connection, close_old_connections
    from models import PendingUpload
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        
        # Ensure database is initialized
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_pendingupload';")
                table_exists = cursor.fetchone()
            if not table_exists:
                print("Table api_pendingupload doesn't exist, initializing...")
                with connection.schema_editor() as schema_editor:
                    schema_editor.create_model(PendingUpload)
                print("Table api_pendingupload created")
        except Exception as init_error:
            print(f"Database init check error (non-fatal): {init_error}")
            import traceback
            traceback.print_exc()
        
        status = request.GET.get('status', 'pending')
        
        # Ensure connection is open
        connection.ensure_connection()
        
        # If status is 'all', get all uploads regardless of status
        if status == 'all':
            queryset = PendingUpload.objects.all().order_by('-created_at')
        else:
            queryset = PendingUpload.objects.filter(status=status).order_by('-created_at')
        
        # Force evaluation by converting to list immediately (before closing connection)
        pending_uploads = list(queryset)
        
        print(f"Fetching uploads with status='{status}': {len(pending_uploads)} found")
        
        # Convert to list to ensure we can serialize
        uploads_list = []
        for u in pending_uploads:
            uploads_list.append({
                'id': u.id,
                'file_name': u.file_name,
                'file_type': u.file_type,
                'uploaded_by': u.uploaded_by,
                'status': u.status,
                'review_notes': u.review_notes,
                'reviewed_by': u.reviewed_by,
                'created_at': u.created_at.isoformat() if u.created_at else None,
                'reviewed_at': u.reviewed_at.isoformat() if u.reviewed_at else None,
            })
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'uploads': uploads_list,
            'total': len(uploads_list),
            'status_filter': status
        })
    except Exception as e:
        print(f"Error in get_pending_uploads: {e}")
        import traceback
        traceback.print_exc()
        # Ensure connection is closed even on error
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e), 'uploads': [], 'total': 0}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_pending_upload_detail(request, upload_id):
    """Get detailed information about a pending upload"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        upload = PendingUpload.objects.get(id=upload_id)
        
        # Parse file content
        file_content = None
        try:
            if upload.file_content:
                file_content = json.loads(upload.file_content)
                # Ensure all values are JSON serializable
                if isinstance(file_content, list):
                    for record in file_content:
                        if isinstance(record, dict):
                            for key, value in record.items():
                                # Convert any non-serializable types
                                try:
                                    # Check for NaN values (pandas/numpy)
                                    if value is None or (hasattr(value, '__class__') and str(value) == 'nan'):
                                        record[key] = ''
                                    elif pd.isna(value):
                                        record[key] = ''
                                    elif not isinstance(value, (str, int, float, bool, type(None))):
                                        # Try to convert to string
                                        record[key] = str(value)
                                except:
                                    # If anything fails, set to empty string
                                    record[key] = ''
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            file_content = None
        except Exception as e:
            print(f"Error parsing file_content: {e}")
            file_content = None
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'id': upload.id,
            'file_name': upload.file_name,
            'file_type': upload.file_type,
            'file_content': file_content if file_content else [],
            'uploaded_by': upload.uploaded_by,
            'status': upload.status,
            'review_notes': upload.review_notes,
            'reviewed_by': upload.reviewed_by,
            'created_at': upload.created_at.isoformat() if upload.created_at else None,
            'reviewed_at': upload.reviewed_at.isoformat() if upload.reviewed_at else None,
        })
    except PendingUpload.DoesNotExist:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': 'Upload not found'}, status=404)
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        print(f"Error in get_pending_upload_detail: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def approve_upload(request, upload_id):
    """Approve a pending upload and add to database"""
    from django.db import connection, close_old_connections
    
    print(f"approve_upload called with upload_id={upload_id}, path={request.path}, method={request.method}")
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        body = request.body.decode('utf-8') if isinstance(request.body, bytes) else request.body
        data = json.loads(body)
        review_notes = data.get('review_notes', '')
        reviewed_by = data.get('reviewed_by', 'admin')
        
        upload = PendingUpload.objects.get(id=upload_id, status='pending')
        
        # Parse file content
        try:
            file_data = json.loads(upload.file_content)
        except Exception as e:
            print(f"Error parsing file_content: {e}")
            return JsonResponse({'error': f'Invalid file content format: {str(e)}'}, status=400)
        
        if not isinstance(file_data, list) or len(file_data) == 0:
            return JsonResponse({'error': 'No data found in file'}, status=400)
        
        # Log the actual column names in the file for debugging
        if len(file_data) > 0:
            actual_columns = list(file_data[0].keys())
            print(f"Actual columns in file: {actual_columns}")
        
        # Helper function to get value from row with multiple possible keys (case-insensitive)
        def get_value(row, possible_keys, default=''):
            # First try exact match
            for key in possible_keys:
                if key in row:
                    value = row[key]
                    return str(value).strip() if value else default
            
            # Then try case-insensitive and normalized match
            for key in possible_keys:
                for row_key in row.keys():
                    # Normalize both keys for comparison (remove spaces, underscores, hyphens, dots, case)
                    def normalize(s):
                        return s.lower().replace(' ', '').replace('_', '').replace('-', '').replace('.', '').strip()
                    
                    if normalize(row_key) == normalize(key):
                        value = row[row_key]
                        return str(value).strip() if value else default
            
            # Try partial match (contains)
            for key in possible_keys:
                key_normalized = key.lower().replace(' ', '').replace('_', '').replace('-', '').replace('.', '')
                for row_key in row.keys():
                    row_key_normalized = row_key.lower().replace(' ', '').replace('_', '').replace('-', '').replace('.', '')
                    # Check if key is contained in row_key or vice versa
                    if key_normalized in row_key_normalized or row_key_normalized in key_normalized:
                        value = row[row_key]
                        return str(value).strip() if value else default
            
            return default
        
        # Process and add to database
        added_count = 0
        error_count = 0
        errors = []
        
        for idx, row in enumerate(file_data):
            try:
                # Get values with flexible column name matching
                name = get_value(row, ['Dataset Name', 'name', 'dataset_name', 'Dataset', 'Title'], '')
                description = get_value(row, ['Description', 'description', 'desc', 'Summary'], '')
                disease_type = get_value(row, ['Disease Type', 'disease_type', 'disease', 'Disease', 'Type'], '')
                
                # Handle sample size - try to convert to int
                sample_size_str = get_value(row, ['Sample Size', 'sample_size', 'Sample Size', 'n', 'N', 'size'], '0')
                try:
                    # Remove any non-numeric characters except minus sign
                    sample_size = int(''.join(c for c in str(sample_size_str) if c.isdigit() or c == '-') or '0')
                except:
                    sample_size = 0
                
                data_accessibility = get_value(row, ['Data Accessibility', 'data_accessibility', 'Accessibility', 'access', 'Access'], '')
                wgs_available = get_value(row, ['WGS Available', 'wgs_available', 'WGS', 'wgs', 'WGS Available?'], '')
                imaging_types = get_value(row, ['Imaging Types', 'imaging_types', 'Imaging', 'imaging', 'Imaging Types'], '')
                modalities = get_value(row, ['Modalities', 'modalities', 'Modality', 'modality', 'Data Types'], '')
                
                # Skip if essential fields are missing
                if not name:
                    error_count += 1
                    available_keys = list(row.keys())
                    errors.append(f"Row {idx + 1}: Missing dataset name. Available columns: {', '.join(available_keys)}")
                    print(f"Row {idx + 1} - Available columns: {available_keys}")
                    print(f"Row {idx + 1} - Row data: {row}")
                    continue
                
                # Create dataset
                try:
                    Dataset.objects.create(
                        name=name,
                        description=description,
                        disease_type=disease_type,
                        sample_size=sample_size,
                        data_accessibility=data_accessibility,
                        wgs_available=wgs_available,
                        imaging_types=imaging_types,
                        modalities=modalities
                    )
                    added_count += 1
                    print(f"Successfully added dataset: {name}")
                except Exception as db_error:
                    error_count += 1
                    error_msg = f"Row {idx + 1}: Database error - {str(db_error)}"
                    errors.append(error_msg)
                    print(f"Database error for row {idx + 1}: {db_error}")
                    import traceback
                    traceback.print_exc()
                
            except Exception as e:
                error_count += 1
                error_msg = f"Row {idx + 1}: {str(e)}"
                errors.append(error_msg)
                print(f"Error processing row {idx + 1}: {e}")
                print(f"Row {idx + 1} data: {row}")
                import traceback
                traceback.print_exc()
        
        # Update upload status - ensure it's saved properly
        upload.status = 'approved'
        upload.review_notes = review_notes
        upload.reviewed_by = reviewed_by
        upload.reviewed_at = timezone.now()
        upload.save(update_fields=['status', 'review_notes', 'reviewed_by', 'reviewed_at'])
        print(f"Upload {upload.id} status updated to: {upload.status}")
        
        # Close connection after use
        connection.close()
        
        # Return result with counts
        message = f'Successfully added {added_count} dataset(s) to the database.'
        if error_count > 0:
            message += f' {error_count} row(s) had errors.'
        
        return JsonResponse({
            'success': True,
            'message': message,
            'added_count': added_count,
            'error_count': error_count,
            'errors': errors[:10] if errors else []  # Return first 10 errors
        })
    except PendingUpload.DoesNotExist:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': 'Upload not found'}, status=404)
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        print(f"Error in approve_upload: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def reject_upload(request, upload_id):
    """Reject a pending upload"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        body = request.body.decode('utf-8') if isinstance(request.body, bytes) else request.body
        data = json.loads(body)
        review_notes = data.get('review_notes', '')
        reviewed_by = data.get('reviewed_by', 'admin')
        
        upload = PendingUpload.objects.get(id=upload_id, status='pending')
        upload.status = 'rejected'
        upload.review_notes = review_notes
        upload.reviewed_by = reviewed_by
        upload.reviewed_at = timezone.now()
        upload.save(update_fields=['status', 'review_notes', 'reviewed_by', 'reviewed_at'])
        print(f"Upload {upload.id} status updated to: {upload.status}")
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'success': True,
            'message': 'Upload rejected'
        })
    except PendingUpload.DoesNotExist:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': 'Upload not found'}, status=404)
    except Exception as e:
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)


# File upload endpoint
@csrf_exempt
@require_http_methods(["POST"])
def upload_file(request):
    """Upload a file for review"""
    from django.db import connection, close_old_connections
    
    try:
        # Close any stale connections and ensure fresh connection
        close_old_connections()
        connection.ensure_connection()
        
        body = request.body.decode('utf-8') if isinstance(request.body, bytes) else request.body
        data = json.loads(body)
        file_name = data.get('file_name')
        file_content = data.get('file_content')  # Base64 encoded or raw text
        file_type = data.get('file_type', 'csv')
        uploaded_by = data.get('uploaded_by', '')
        
        if not file_name or not file_content:
            return JsonResponse({'error': 'File name and content required'}, status=400)
        
        # Parse file content based on type
        parsed_content = None
        try:
            if file_type == 'csv':
                # If base64 encoded, decode it
                if file_content.startswith('data:'):
                    # Remove data URL prefix
                    file_content = file_content.split(',')[1]
                
                try:
                    # Try to decode base64
                    decoded = base64.b64decode(file_content)
                    content_str = decoded.decode('utf-8')
                except:
                    # If not base64, use as-is
                    content_str = file_content
                
                # Parse CSV
                csv_reader = csv.DictReader(io.StringIO(content_str))
                parsed_content = list(csv_reader)
            elif file_type in ['xlsx', 'xls']:
                # For Excel files, decode base64 and parse
                if file_content.startswith('data:'):
                    file_content = file_content.split(',')[1]
                
                decoded = base64.b64decode(file_content)
                df = pd.read_excel(io.BytesIO(decoded))
                
                # Replace NaN values and convert to native Python types
                df = df.fillna('')  # Replace NaN with empty string
                
                # Convert all columns to string first to avoid type issues, then parse back
                # This ensures all data is JSON serializable
                parsed_content = []
                for _, row in df.iterrows():
                    record = {}
                    for col in df.columns:
                        value = row[col]
                        # Convert to native Python type
                        if pd.isna(value) or value == '':
                            record[col] = ''
                        elif isinstance(value, (pd.Timestamp, pd.DatetimeTZDtype)):
                            record[col] = str(value)
                        elif hasattr(value, 'item'):  # numpy types
                            try:
                                record[col] = value.item()
                            except:
                                record[col] = str(value)
                        elif isinstance(value, (int, float)):
                            # Keep numbers as-is but ensure they're native Python types
                            record[col] = float(value) if isinstance(value, float) else int(value)
                        elif isinstance(value, bool):
                            record[col] = bool(value)
                        else:
                            # Convert everything else to string
                            record[col] = str(value) if value else ''
                    parsed_content.append(record)
            else:
                return JsonResponse({'error': 'Unsupported file type'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Error parsing file: {str(e)}'}, status=400)
        
        # Save as pending upload
        # Ensure parsed_content is JSON serializable before saving
        try:
            # Test JSON serialization
            json_str = json.dumps(parsed_content)
            # If successful, save to database
            pending_upload = PendingUpload.objects.create(
                file_name=file_name,
                file_content=json_str,
                file_type=file_type,
                uploaded_by=uploaded_by,
                status='pending'
            )
            # Force commit by accessing the ID (ensures it's saved)
            upload_id = pending_upload.id
            print(f"Created pending upload with ID: {upload_id}, file_name: {file_name}")
            
            # Close connection after use
            connection.close()
        except (TypeError, ValueError) as e:
            # If JSON serialization fails, try to clean the data more
            print(f"JSON serialization error: {e}")
            # Clean the data one more time
            cleaned_content = []
            for record in parsed_content:
                cleaned_record = {}
                for key, value in record.items():
                    try:
                        # Try to serialize each value
                        json.dumps(value)
                        cleaned_record[key] = value
                    except:
                        # If it fails, convert to string
                        cleaned_record[key] = str(value) if value else ''
                cleaned_content.append(cleaned_record)
            
            pending_upload = PendingUpload.objects.create(
                file_name=file_name,
                file_content=json.dumps(cleaned_content),
                file_type=file_type,
                uploaded_by=uploaded_by,
                status='pending'
            )
            # Force commit by accessing the ID
            upload_id = pending_upload.id
            print(f"Created pending upload with ID: {upload_id}, file_name: {file_name}")
        
        # Close connection after use
        connection.close()
        
        return JsonResponse({
            'success': True,
            'message': 'File uploaded successfully and pending review',
            'upload_id': upload_id
        })
    except Exception as e:
        # Ensure connection is closed even on error
        try:
            connection.close()
        except:
            pass
        return JsonResponse({'error': str(e)}, status=500)

