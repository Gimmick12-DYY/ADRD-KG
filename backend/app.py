from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import os
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

def load_sample_data():
    """Load sample data from Excel file if it exists"""
    try:
        # Try to load from the Excel file
        excel_path = os.path.join(os.path.dirname(__file__), '..', 'ADRD_Metadata_Sample.xlsx')
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
    
    app.run(debug=True, host='0.0.0.0', port=5000)
