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

## Installation Guide

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/ADRD-KG.git
cd ADRD-KG
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Virtual Environment

**On Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

> **Note:** If you have multiple Python versions, use `python3` instead of `python`

#### 2.3 Upgrade pip and Install Dependencies

```bash
# Upgrade pip to latest version
python -m pip install --upgrade pip setuptools wheel

# Install Python dependencies
pip install -r requirements.txt
```

#### 2.4 Verify Backend Installation

```bash
# Test the Flask application
python app.py
```

You should see output similar to:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

**Test the API:**
Open a new terminal and run:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status": "healthy", "message": "ADRD Knowledge Graph API is running"}
```

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
# From the project root
cd frontend
```

#### 3.2 Install Node.js Dependencies

```bash
# Install all required packages
npm install
```

#### 3.3 Start the Development Server

```bash
# Start the React development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 4: Verify Complete Setup

1. **Backend API:** Visit `http://localhost:5000/api/health`
2. **Frontend Application:** Visit `http://localhost:5173`
3. **Full Application:** The frontend should connect to the backend automatically

## Quick Start Script

For convenience, you can use the provided startup script:

```bash
# Make the script executable (macOS/Linux)
chmod +x start.sh

# Run both backend and frontend
./start.sh
```

**Windows users:** Run the commands manually in separate terminals:
```cmd
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Detailed Setup Instructions

### Backend Configuration

#### Environment Variables (Optional)
Create a `.env` file in the backend directory:
```env
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///adrd_knowledge_graph.db
```

#### Database Initialization
The SQLite database is automatically created on first run. To reset the database:
```bash
cd backend
rm instance/adrd_knowledge_graph.db
python app.py
```

#### Custom Port Configuration
To run on a different port:
```bash
export FLASK_RUN_PORT=8000  # macOS/Linux
set FLASK_RUN_PORT=8000     # Windows
python app.py
```

### Frontend Configuration

#### Vite Configuration
The frontend uses Vite for development. Configuration is in `frontend/vite.config.ts`:
- **Proxy:** API calls to `/api/*` are automatically proxied to `http://localhost:5000`
- **Port:** Default development port is 5173

#### Custom Port Configuration
To run on a different port:
```bash
npm run dev -- --port 3000
```

#### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Troubleshooting

### Common Issues and Solutions

#### Python Installation Issues

**Issue:** `python: command not found`
```bash
# macOS (using Homebrew)
brew install python@3.11

# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv

# Windows
# Download from https://python.org/downloads/
```

**Issue:** `pip: command not found`
```bash
# Install pip
python -m ensurepip --upgrade
# or
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python get-pip.py
```

#### Python 3.13 Compatibility Issues

**Error:** `AttributeError: module 'pkgutil' has no attribute 'ImpImporter'`

**Solution 1: Use Python 3.11 or 3.12 (Recommended)**
```bash
# Install Python 3.12
# macOS
brew install python@3.12
python3.12 -m venv venv

# Ubuntu
sudo apt install python3.12 python3.12-venv
python3.12 -m venv venv
```

**Solution 2: Force Installation**
```bash
pip install --no-build-isolation -r requirements.txt
```

**Solution 3: Install Packages Individually**
```bash
pip install Flask==2.3.3
pip install Flask-CORS==4.0.0
pip install Flask-SQLAlchemy==3.0.5
pip install pandas==2.0.3
pip install openpyxl==3.1.2
```

#### Node.js Installation Issues

**Issue:** `npm: command not found`

**macOS:**
```bash
# Using Homebrew
brew install node

# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Ubuntu/Debian:**
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
- Download from https://nodejs.org/
- Choose the LTS version
- Ensure "Add to PATH" is checked during installation

#### Backend Connection Issues

**Issue:** Frontend can't connect to backend

1. **Check if backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check firewall settings:**
   - Windows: Allow Python through Windows Firewall
   - macOS: System Preferences > Security & Privacy > Firewall
   - Linux: `sudo ufw allow 5000`

3. **Check port conflicts:**
   ```bash
   # Check if port 5000 is in use
   netstat -an | grep 5000  # macOS/Linux
   netstat -an | findstr 5000  # Windows
   ```

#### Frontend Build Issues

**Issue:** `npm install` fails

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use different package manager:**
   ```bash
   # Try with yarn
   npm install -g yarn
   yarn install
   ```

**Issue:** Vite development server issues

1. **Check if port 5173 is available:**
   ```bash
   npm run dev -- --port 3000
   ```

2. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Platform-Specific Notes

#### Windows
- Use PowerShell or Command Prompt as Administrator for installation
- Ensure Python and Node.js are added to PATH
- Use `venv\Scripts\activate` for virtual environment activation
- Consider using Windows Subsystem for Linux (WSL) for better compatibility

#### macOS
- Install Xcode Command Line Tools: `xcode-select --install`
- Use Homebrew for package management: `brew install python@3.11 node`
- May need to allow Python through System Preferences > Security & Privacy

#### Linux (Ubuntu/Debian)
- Update package lists: `sudo apt update`
- Install build essentials: `sudo apt install build-essential`
- May need to install additional dependencies for some Python packages

## Development Workflow

### Making Changes

1. **Backend Changes:**
   - Edit files in `backend/`
   - Flask auto-reloads on file changes
   - Test API endpoints with curl or Postman

2. **Frontend Changes:**
   - Edit files in `frontend/src/`
   - Vite hot-reloads on file changes
   - Browser automatically refreshes

### Adding New Features

1. **Backend API:**
   ```python
   # Add new route in backend/app.py
   @app.route('/api/new-endpoint', methods=['GET'])
   def new_endpoint():
       return jsonify({"message": "New feature"})
   ```

2. **Frontend Component:**
   ```typescript
   // Create new component in frontend/src/components/
   import React from 'react';
   
   const NewComponent: React.FC = () => {
     return <div>New Component</div>;
   };
   
   export default NewComponent;
   ```

### Database Management

**View Database:**
```bash
# Install SQLite browser
# macOS: brew install --cask db-browser-for-sqlite
# Windows: Download from https://sqlitebrowser.org/
# Linux: sudo apt install sqlitebrowser

# Open database
sqlite3 backend/instance/adrd_knowledge_graph.db
```

**Reset Database:**
```bash
cd backend
rm instance/adrd_knowledge_graph.db
python app.py
```

## Production Deployment

### Backend Deployment

1. **Set Environment Variables:**
   ```bash
   export FLASK_ENV=production
   export FLASK_DEBUG=False
   ```

2. **Use Production WSGI Server:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Frontend Deployment

1. **Build for Production:**
   ```bash
   npm run build
   ```

2. **Serve Static Files:**
   ```bash
   # Using serve
   npm install -g serve
   serve -s dist -l 3000
   
   # Or deploy to static hosting (Netlify, Vercel, etc.)
   ```

### Docker Deployment (Optional)

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Support and Contributing

### Getting Help

1. **Check the troubleshooting section above**
2. **Review existing issues on GitHub**
3. **Create a new issue with:**
   - Operating system and version
   - Python and Node.js versions
   - Complete error messages
   - Steps to reproduce the issue

### Contributing

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Code Style

- **Python:** Follow PEP 8 guidelines
- **TypeScript/React:** Use ESLint and Prettier configurations
- **Commits:** Use conventional commit messages

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

## Known Issues & Solutions

### Python 3.13 Compatibility
Some Python packages haven't fully updated for Python 3.13 compatibility, causing `pkgutil.ImpImporter` errors.

**Solutions:**
1. **Use Python 3.11 or 3.12** (Most reliable)
2. **Try the no-build-isolation flag:** `pip install --no-build-isolation -r requirements.txt`
3. **Install packages individually** as shown in the troubleshooting section above

### Windows-Specific Issues
- Ensure you're using the correct virtual environment activation command: `venv\Scripts\activate`
- If you encounter permission errors, run PowerShell as Administrator
- Consider using Windows Subsystem for Linux (WSL) for a more Unix-like environment

### Node.js/npm Issues
- If npm is not recognized, ensure Node.js is properly installed and added to PATH
- Try using `npx` instead of `npm` for package execution
- Clear npm cache if installation fails: `npm cache clean --force`

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

