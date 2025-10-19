from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q, Count, Avg, Min, Max
from django.db import models
import csv
import io
import json
from .models import Dataset, Publication


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
    try:
        # Get query parameters
        disease_type = request.GET.get('disease_type')
        modality = request.GET.get('modality')
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 10))
        
        # Build query
        queryset = Dataset.objects.all()
        
        if disease_type:
            queryset = queryset.filter(disease_type__icontains=disease_type)
        
        if modality:
            queryset = queryset.filter(modalities__icontains=modality)
            
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Paginate results
        paginator = Paginator(queryset, per_page)
        datasets_page = paginator.get_page(page)
        
        return JsonResponse({
            'datasets': [{
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
            } for d in datasets_page],
            'total': paginator.count,
            'pages': paginator.num_pages,
            'current_page': page
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_dataset(request, dataset_id):
    """Get a specific dataset by ID"""
    try:
        dataset = Dataset.objects.get(id=dataset_id)
        return JsonResponse({
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
        })
    except Dataset.DoesNotExist:
        return JsonResponse({'error': 'Dataset not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_publications(request):
    """Get all publications with optional filtering"""
    try:
        # Get query parameters
        dataset_name = request.GET.get('dataset_name')
        title_search = request.GET.get('title_search')
        year = request.GET.get('year')
        page = int(request.GET.get('page', 1))
        per_page = int(request.GET.get('per_page', 10))
        
        # Build query
        queryset = Publication.objects.all()
        
        if dataset_name:
            queryset = queryset.filter(dataset_name__icontains=dataset_name)
            
        if title_search:
            queryset = queryset.filter(title__icontains=title_search)
            
        if year:
            queryset = queryset.filter(year=int(year))
        
        # Order by year descending
        queryset = queryset.order_by('-year')
        
        # Paginate results
        paginator = Paginator(queryset, per_page)
        publications_page = paginator.get_page(page)
        
        return JsonResponse({
            'publications': [{
                'id': p.id,
                'title': p.title,
                'authors': p.authors,
                'journal': p.journal,
                'year': p.year,
                'pmid': p.pmid,
                'doi': p.doi,
                'dataset_name': p.dataset_name,
                'created_at': p.created_at.isoformat() if p.created_at else None
            } for p in publications_page],
            'total': paginator.count,
            'pages': paginator.num_pages,
            'current_page': page
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_stats(request):
    """Get summary statistics"""
    try:
        total_datasets = Dataset.objects.count()
        total_publications = Publication.objects.count()
        
        # Disease type distribution
        disease_stats = Dataset.objects.values('disease_type').annotate(
            count=Count('id')
        ).filter(disease_type__isnull=False)
        
        return JsonResponse({
            'total_datasets': total_datasets,
            'total_publications': total_publications,
            'disease_distribution': [
                {'disease_type': stat['disease_type'], 'count': stat['count']} 
                for stat in disease_stats
            ]
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_filters(request):
    """Get available filter options"""
    try:
        # Get unique disease types
        disease_types = Dataset.objects.values_list('disease_type', flat=True).distinct()
        disease_types = [d for d in disease_types if d]
        
        # Get unique modalities (this would need to be parsed from JSON in production)
        modalities = [
            "MRI", "fMRI", "PET", "DTI", "ASL",
            "SNP Genotyping", "WGS", "WES", "RNA", "Epigenomics", 
            "Proteomics", "Metabolomics", "EHR", "Clinical Cognitive Tests"
        ]
        
        return JsonResponse({
            'disease_types': sorted(disease_types),
            'modalities': sorted(modalities)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def search_datasets(request):
    """Advanced search for datasets"""
    try:
        query = request.GET.get('q', '')
        disease_type = request.GET.get('disease_type')
        modality = request.GET.get('modality')
        min_sample_size = request.GET.get('min_sample_size')
        max_sample_size = request.GET.get('max_sample_size')
        data_access = request.GET.get('data_accessibility')
        wgs_available = request.GET.get('wgs_available')
        
        # Build search query
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
        
        datasets = search_query.all()
        
        return JsonResponse({
            'datasets': [{
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
            } for d in datasets],
            'total': len(datasets)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def search_publications(request):
    """Advanced search for publications"""
    try:
        query = request.GET.get('q', '')
        dataset_name = request.GET.get('dataset_name')
        journal = request.GET.get('journal')
        min_year = request.GET.get('min_year')
        max_year = request.GET.get('max_year')
        author = request.GET.get('author')
        
        # Build search query
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
        
        publications = search_query.order_by('-year').all()
        
        return JsonResponse({
            'publications': [{
                'id': p.id,
                'title': p.title,
                'authors': p.authors,
                'journal': p.journal,
                'year': p.year,
                'pmid': p.pmid,
                'doi': p.doi,
                'dataset_name': p.dataset_name,
                'created_at': p.created_at.isoformat() if p.created_at else None
            } for p in publications],
            'total': len(publications)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def export_datasets(request):
    """Export datasets to CSV"""
    try:
        format_type = request.GET.get('format', 'csv')
        
        datasets = Dataset.objects.all()
        
        if format_type == 'csv':
            # Create CSV data
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
            
            return response
        
        return JsonResponse({'error': 'Unsupported format'}, status=400)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def export_publications(request):
    """Export publications to CSV"""
    try:
        format_type = request.GET.get('format', 'csv')
        
        publications = Publication.objects.all()
        
        if format_type == 'csv':
            # Create CSV data
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
            
            return response
        
        return JsonResponse({'error': 'Unsupported format'}, status=400)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_dataset_publications(request, dataset_id):
    """Get publications for a specific dataset"""
    try:
        dataset = Dataset.objects.get(id=dataset_id)
        publications = Publication.objects.filter(dataset_name=dataset.name)
        
        return JsonResponse({
            'dataset': {
                'id': dataset.id,
                'name': dataset.name,
                'description': dataset.description
            },
            'publications': [{
                'id': p.id,
                'title': p.title,
                'authors': p.authors,
                'journal': p.journal,
                'year': p.year,
                'pmid': p.pmid,
                'doi': p.doi
            } for p in publications],
            'total': len(publications)
        })
        
    except Dataset.DoesNotExist:
        return JsonResponse({'error': 'Dataset not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_analytics_overview(request):
    """Get comprehensive analytics overview"""
    try:
        # Basic counts
        total_datasets = Dataset.objects.count()
        total_publications = Publication.objects.count()
        
        # Disease type distribution
        disease_stats = Dataset.objects.values('disease_type').annotate(
            count=Count('id')
        ).filter(disease_type__isnull=False)
        
        # Sample size statistics
        sample_sizes = Dataset.objects.filter(sample_size__isnull=False).values_list('sample_size', flat=True)
        sample_sizes = [s for s in sample_sizes if s]
        
        # Publication year distribution
        year_stats = Publication.objects.values('year').annotate(
            count=Count('id')
        ).filter(year__isnull=False).order_by('-year')
        
        # Data accessibility distribution
        access_stats = Dataset.objects.values('data_accessibility').annotate(
            count=Count('id')
        ).filter(data_accessibility__isnull=False)
        
        # WGS availability
        wgs_stats = Dataset.objects.values('wgs_available').annotate(
            count=Count('id')
        ).filter(wgs_available__isnull=False)
        
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
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_recent_datasets(request):
    """Get recently added datasets"""
    try:
        limit = int(request.GET.get('limit', 5))
        datasets = Dataset.objects.order_by('-created_at')[:limit]
        
        return JsonResponse({
            'datasets': [{
                'id': d.id,
                'name': d.name,
                'description': d.description,
                'disease_type': d.disease_type,
                'sample_size': d.sample_size,
                'created_at': d.created_at.isoformat() if d.created_at else None
            } for d in datasets]
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_recent_publications(request):
    """Get recently added publications"""
    try:
        limit = int(request.GET.get('limit', 5))
        publications = Publication.objects.order_by('-created_at')[:limit]
        
        return JsonResponse({
            'publications': [{
                'id': p.id,
                'title': p.title,
                'authors': p.authors,
                'journal': p.journal,
                'year': p.year,
                'dataset_name': p.dataset_name,
                'created_at': p.created_at.isoformat() if p.created_at else None
            } for p in publications]
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
