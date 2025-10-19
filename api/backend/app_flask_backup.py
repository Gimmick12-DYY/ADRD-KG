from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import os
import json
import io
from datetime import datetime

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///adrd_knowledge_graph.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Models
class Dataset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    description = db.Column(db.Text)
    disease_type = db.Column(db.String(100))
    sample_size = db.Column(db.Integer)
    data_accessibility = db.Column(db.String(100))
    wgs_available = db.Column(db.String(50))
    imaging_types = db.Column(db.String(500))
    modalities = db.Column(db.Text)  # JSON string of available modalities
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Publication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    authors = db.Column(db.Text)
    journal = db.Column(db.String(200))
    year = db.Column(db.Integer)
    pmid = db.Column(db.String(20))
    doi = db.Column(db.String(100))
    dataset_name = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'ADRD Knowledge Graph API is running'})

@app.route('/api/datasets', methods=['GET'])
def get_datasets():
    """Get all datasets with optional filtering"""
    try:
        # Get query parameters
        disease_type = request.args.get('disease_type')
        modality = request.args.get('modality')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Build query
        query = Dataset.query
        
        if disease_type:
            query = query.filter(Dataset.disease_type.ilike(f'%{disease_type}%'))
        
        if modality:
            query = query.filter(Dataset.modalities.ilike(f'%{modality}%'))
            
        if search:
            query = query.filter(Dataset.name.ilike(f'%{search}%'))
        
        # Paginate results
        datasets = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
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
            } for d in datasets.items],
            'total': datasets.total,
            'pages': datasets.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/datasets/<int:dataset_id>', methods=['GET'])
def get_dataset(dataset_id):
    """Get a specific dataset by ID"""
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        return jsonify({
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
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/publications', methods=['GET'])
def get_publications():
    """Get all publications with optional filtering"""
    try:
        # Get query parameters
        dataset_name = request.args.get('dataset_name')
        title_search = request.args.get('title_search')
        year = request.args.get('year', type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Build query
        query = Publication.query
        
        if dataset_name:
            query = query.filter(Publication.dataset_name.ilike(f'%{dataset_name}%'))
            
        if title_search:
            query = query.filter(Publication.title.ilike(f'%{title_search}%'))
            
        if year:
            query = query.filter(Publication.year == year)
        
        # Order by year descending
        query = query.order_by(Publication.year.desc())
        
        # Paginate results
        publications = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
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
            } for p in publications.items],
            'total': publications.total,
            'pages': publications.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get summary statistics"""
    try:
        total_datasets = Dataset.query.count()
        total_publications = Publication.query.count()
        
        # Disease type distribution
        disease_stats = db.session.query(
            Dataset.disease_type, db.func.count(Dataset.id)
        ).group_by(Dataset.disease_type).all()
        
        return jsonify({
            'total_datasets': total_datasets,
            'total_publications': total_publications,
            'disease_distribution': [
                {'disease_type': stat[0], 'count': stat[1]} 
                for stat in disease_stats if stat[0]
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/filters', methods=['GET'])
def get_filters():
    """Get available filter options"""
    try:
        # Get unique disease types
        disease_types = db.session.query(Dataset.disease_type).distinct().all()
        disease_types = [d[0] for d in disease_types if d[0]]
        
        # Get unique modalities (this would need to be parsed from JSON in production)
        modalities = [
            "MRI", "fMRI", "PET", "DTI", "ASL",
            "SNP Genotyping", "WGS", "WES", "RNA", "Epigenomics", 
            "Proteomics", "Metabolomics", "EHR", "Clinical Cognitive Tests"
        ]
        
        return jsonify({
            'disease_types': sorted(disease_types),
            'modalities': sorted(modalities)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/datasets/search', methods=['GET'])
def search_datasets():
    """Advanced search for datasets"""
    try:
        query = request.args.get('q', '')
        disease_type = request.args.get('disease_type')
        modality = request.args.get('modality')
        min_sample_size = request.args.get('min_sample_size', type=int)
        max_sample_size = request.args.get('max_sample_size', type=int)
        data_access = request.args.get('data_accessibility')
        wgs_available = request.args.get('wgs_available')
        
        # Build search query
        search_query = Dataset.query
        
        if query:
            search_query = search_query.filter(
                db.or_(
                    Dataset.name.ilike(f'%{query}%'),
                    Dataset.description.ilike(f'%{query}%')
                )
            )
        
        if disease_type:
            search_query = search_query.filter(Dataset.disease_type.ilike(f'%{disease_type}%'))
        
        if modality:
            search_query = search_query.filter(Dataset.modalities.ilike(f'%{modality}%'))
        
        if min_sample_size:
            search_query = search_query.filter(Dataset.sample_size >= min_sample_size)
        
        if max_sample_size:
            search_query = search_query.filter(Dataset.sample_size <= max_sample_size)
        
        if data_access:
            search_query = search_query.filter(Dataset.data_accessibility.ilike(f'%{data_access}%'))
        
        if wgs_available:
            search_query = search_query.filter(Dataset.wgs_available.ilike(f'%{wgs_available}%'))
        
        datasets = search_query.all()
        
        return jsonify({
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/publications/search', methods=['GET'])
def search_publications():
    """Advanced search for publications"""
    try:
        query = request.args.get('q', '')
        dataset_name = request.args.get('dataset_name')
        journal = request.args.get('journal')
        min_year = request.args.get('min_year', type=int)
        max_year = request.args.get('max_year', type=int)
        author = request.args.get('author')
        
        # Build search query
        search_query = Publication.query
        
        if query:
            search_query = search_query.filter(
                db.or_(
                    Publication.title.ilike(f'%{query}%'),
                    Publication.authors.ilike(f'%{query}%')
                )
            )
        
        if dataset_name:
            search_query = search_query.filter(Publication.dataset_name.ilike(f'%{dataset_name}%'))
        
        if journal:
            search_query = search_query.filter(Publication.journal.ilike(f'%{journal}%'))
        
        if min_year:
            search_query = search_query.filter(Publication.year >= min_year)
        
        if max_year:
            search_query = search_query.filter(Publication.year <= max_year)
        
        if author:
            search_query = search_query.filter(Publication.authors.ilike(f'%{author}%'))
        
        publications = search_query.order_by(Publication.year.desc()).all()
        
        return jsonify({
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/datasets/export', methods=['GET'])
def export_datasets():
    """Export datasets to CSV"""
    try:
        format_type = request.args.get('format', 'csv')
        
        datasets = Dataset.query.all()
        
        if format_type == 'csv':
            # Create CSV data
            data = []
            for d in datasets:
                data.append({
                    'ID': d.id,
                    'Name': d.name,
                    'Description': d.description,
                    'Disease Type': d.disease_type,
                    'Sample Size': d.sample_size,
                    'Data Accessibility': d.data_accessibility,
                    'WGS Available': d.wgs_available,
                    'Imaging Types': d.imaging_types,
                    'Modalities': d.modalities,
                    'Created At': d.created_at.isoformat() if d.created_at else None
                })
            
            df = pd.DataFrame(data)
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)
            
            return send_file(
                io.BytesIO(output.getvalue().encode()),
                mimetype='text/csv',
                as_attachment=True,
                download_name='adrd_datasets.csv'
            )
        
        return jsonify({'error': 'Unsupported format'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/publications/export', methods=['GET'])
def export_publications():
    """Export publications to CSV"""
    try:
        format_type = request.args.get('format', 'csv')
        
        publications = Publication.query.all()
        
        if format_type == 'csv':
            # Create CSV data
            data = []
            for p in publications:
                data.append({
                    'ID': p.id,
                    'Title': p.title,
                    'Authors': p.authors,
                    'Journal': p.journal,
                    'Year': p.year,
                    'PMID': p.pmid,
                    'DOI': p.doi,
                    'Dataset Name': p.dataset_name,
                    'Created At': p.created_at.isoformat() if p.created_at else None
                })
            
            df = pd.DataFrame(data)
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)
            
            return send_file(
                io.BytesIO(output.getvalue().encode()),
                mimetype='text/csv',
                as_attachment=True,
                download_name='adrd_publications.csv'
            )
        
        return jsonify({'error': 'Unsupported format'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/datasets/<int:dataset_id>/publications', methods=['GET'])
def get_dataset_publications(dataset_id):
    """Get publications for a specific dataset"""
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        publications = Publication.query.filter_by(dataset_name=dataset.name).all()
        
        return jsonify({
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
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/overview', methods=['GET'])
def get_analytics_overview():
    """Get comprehensive analytics overview"""
    try:
        # Basic counts
        total_datasets = Dataset.query.count()
        total_publications = Publication.query.count()
        
        # Disease type distribution
        disease_stats = db.session.query(
            Dataset.disease_type, db.func.count(Dataset.id)
        ).group_by(Dataset.disease_type).all()
        
        # Sample size statistics
        sample_sizes = db.session.query(Dataset.sample_size).filter(
            Dataset.sample_size.isnot(None)
        ).all()
        sample_sizes = [s[0] for s in sample_sizes if s[0]]
        
        # Publication year distribution
        year_stats = db.session.query(
            Publication.year, db.func.count(Publication.id)
        ).group_by(Publication.year).order_by(Publication.year.desc()).all()
        
        # Data accessibility distribution
        access_stats = db.session.query(
            Dataset.data_accessibility, db.func.count(Dataset.id)
        ).group_by(Dataset.data_accessibility).all()
        
        # WGS availability
        wgs_stats = db.session.query(
            Dataset.wgs_available, db.func.count(Dataset.id)
        ).group_by(Dataset.wgs_available).all()
        
        return jsonify({
            'overview': {
                'total_datasets': total_datasets,
                'total_publications': total_publications,
                'avg_sample_size': sum(sample_sizes) / len(sample_sizes) if sample_sizes else 0,
                'min_sample_size': min(sample_sizes) if sample_sizes else 0,
                'max_sample_size': max(sample_sizes) if sample_sizes else 0
            },
            'disease_distribution': [
                {'disease_type': stat[0], 'count': stat[1]} 
                for stat in disease_stats if stat[0]
            ],
            'publication_years': [
                {'year': stat[0], 'count': stat[1]} 
                for stat in year_stats if stat[0]
            ],
            'data_accessibility': [
                {'accessibility': stat[0], 'count': stat[1]} 
                for stat in access_stats if stat[0]
            ],
            'wgs_availability': [
                {'availability': stat[0], 'count': stat[1]} 
                for stat in wgs_stats if stat[0]
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/datasets/recent', methods=['GET'])
def get_recent_datasets():
    """Get recently added datasets"""
    try:
        limit = request.args.get('limit', 5, type=int)
        datasets = Dataset.query.order_by(Dataset.created_at.desc()).limit(limit).all()
        
        return jsonify({
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
        return jsonify({'error': str(e)}), 500

@app.route('/api/publications/recent', methods=['GET'])
def get_recent_publications():
    """Get recently added publications"""
    try:
        limit = request.args.get('limit', 5, type=int)
        publications = Publication.query.order_by(Publication.created_at.desc()).limit(limit).all()
        
        return jsonify({
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
        return jsonify({'error': str(e)}), 500

def load_sample_data():
    """Load sample data from Excel file if it exists"""
    try:
        # Try to load from the Excel file
        excel_path = os.path.join(os.path.dirname(__file__), '..', 'ADRD_Metadata_Sample_Big.xlsx')
        if os.path.exists(excel_path):
            df = pd.read_excel(excel_path)
            
            for _, row in df.iterrows():
                # Check if dataset already exists
                existing = Dataset.query.filter_by(name=row.get('Dataset Name (Text)', '')).first()
                if not existing:
                    dataset = Dataset(
                        name=row.get('Dataset Name (Text)', ''),
                        description=row.get('Description', ''),
                        disease_type=row.get('Disease Type (e.g., AD, LBD, FTD, VaD, Mixed) (Text)', ''),
                        sample_size=row.get('Sample Size (Observations) (Integer)', None),
                        data_accessibility=row.get('Data Accessibility (Text)', ''),
                        wgs_available=row.get('WGS Data Available (Text)', ''),
                        imaging_types=row.get('Imaging Data Types Available (Text)', ''),
                        modalities='["MRI", "PET", "WGS"]'  # This should be properly parsed
                    )
                    db.session.add(dataset)
            
            db.session.commit()
            print(f"Loaded {len(df)} datasets from Excel file")
            
    except Exception as e:
        print(f"Error loading sample data: {e}")

# Initialize database
@app.before_request
def create_tables():
    db.create_all()
    load_sample_data()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        load_sample_data()
    
    app.run(debug=True, host='0.0.0.0', port=5173)
