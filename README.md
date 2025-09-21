# ADRD Knowledge Graph

A comprehensive information sharing website for Alzheimer's Disease and Related Dementia (ADRD) research datasets and publications.

## Overview

The ADRD Knowledge Graph is a modern web application built with Flask (backend) and React (frontend) that serves as a centralized platform for exploring and accessing ADRD research data. It provides researchers with tools to discover datasets, browse publications, and understand relationships within the ADRD research ecosystem.

## Features

### **Dataset Discovery**
- Browse comprehensive collection of ADRD research datasets
- Advanced filtering by disease type, data modality, sample size, and accessibility
- Detailed metadata including sample sizes, data types, and access requirements
- Visual analytics and distribution charts

### **Publication Database**
- Searchable database of research publications linked to datasets
- PubMed and DOI integration for direct access to papers
- Filter by dataset, publication year, and research topics
- Author and journal information

### **Knowledge Graph** (Coming Soon)
- Interactive visualization of relationships between datasets, publications, and researchers
- Network analysis of research collaborations
- Temporal analysis of research trends
- Entity relationship discovery

### **Documentation & API**
- Comprehensive API documentation
- Data access procedures and guidelines
- Privacy and security information
- Technical support resources

## Technology Stack

### Backend (Flask)
- **Flask 2.3.3** - Web framework
- **Flask-SQLAlchemy** - Database ORM
- **Flask-CORS** - Cross-origin resource sharing
- **Pandas** - Data processing
- **SQLite** - Database (easily upgradeable to PostgreSQL)

### Frontend (React)
- **React 18** with TypeScript
- **Material-UI (MUI)** - Modern UI components
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client

## Project Structure

```
ADRD-KG/
├── backend/
│   ├── app.py                 # Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── App.tsx           # Main application
│   │   └── index.tsx         # Application entry point
│   └── package.json          # Node.js dependencies
├── ADRD_Metadata_Sample.xlsx  # Sample dataset metadata
├── pubmed_refs_fetched.csv    # Sample publication data
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask application:**
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

## API Endpoints

### Core Endpoints

- `GET /api/health` - Health check
- `GET /api/datasets` - Retrieve datasets with filtering
- `GET /api/datasets/{id}` - Get specific dataset
- `GET /api/publications` - Retrieve publications with filtering
- `GET /api/stats` - Get summary statistics
- `GET /api/filters` - Get available filter options

### Query Parameters

**Datasets:**
- `disease_type` - Filter by disease type
- `modality` - Filter by data modality
- `search` - Search dataset names
- `page` - Page number
- `per_page` - Results per page

**Publications:**
- `dataset_name` - Filter by associated dataset
- `title_search` - Search publication titles
- `year` - Filter by publication year

## Data Sources

The application currently supports:
- **Excel metadata files** for dataset information
- **CSV files** for publication data
- **Extensible architecture** for additional data sources

## Development

### Adding New Features

1. **Backend:** Add new routes in `backend/app.py`
2. **Frontend:** Create components in `frontend/src/components/` or pages in `frontend/src/pages/`
3. **API Integration:** Update `frontend/src/services/apiService.ts`

### Database Schema

The application uses SQLAlchemy models:
- `Dataset` - Dataset metadata and information
- `Publication` - Research publication details

### Styling

The frontend uses Material-UI with a custom theme:
- Primary color: `#004c97` (Deep blue)
- Secondary color: `#8E7DBE` (Dusty lavender)
- Consistent spacing and typography

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions, support, or collaboration opportunities:
- Technical Support: support@adrd-kg.org
- Research Collaboration: research@adrd-kg.org

## Acknowledgments

- ADNI (Alzheimer's Disease Neuroimaging Initiative)
- AMP-AD (Accelerating Medicines Partnership - Alzheimer's Disease)
- NACC (National Alzheimer's Coordinating Center)
- All contributing research institutions and datasets