import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Pagination,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  ExpandMore,
  Dataset as DatasetIcon,
  People,
  Lock,
  LockOpen,
  Science,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import apiService, { Dataset, FilterOptions } from '../services/apiService';

const DatasetsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ disease_types: [], modalities: [] });

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedDiseaseType, setSelectedDiseaseType] = useState(searchParams.get('disease_type') || '');
  const [selectedModality, setSelectedModality] = useState(searchParams.get('modality') || '');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [currentPage, searchTerm, selectedDiseaseType, selectedModality]);

  const fetchFilterOptions = async () => {
    try {
      const options = await apiService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      // Set mock data for demonstration
      setFilterOptions({
        disease_types: ['Alzheimer\'s Disease', 'Mixed Dementia', 'Frontotemporal Dementia', 'Lewy Body Disease'],
        modalities: ['MRI', 'fMRI', 'PET', 'WGS', 'RNA-seq', 'Proteomics']
      });
    }
  };

  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        per_page: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDiseaseType && { disease_type: selectedDiseaseType }),
        ...(selectedModality && { modality: selectedModality }),
      };

      const response = await apiService.getDatasets(params);
      setDatasets(response.datasets);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setError('Failed to load datasets. Showing mock data for demonstration.');
      
      // Mock data for demonstration
      setDatasets([
        {
          id: 1,
          name: 'ADNI - Alzheimer\'s Disease Neuroimaging Initiative',
          description: 'Longitudinal multisite study designed to develop clinical, imaging, genetic, and biochemical biomarkers for the early detection and tracking of Alzheimer\'s disease.',
          disease_type: 'Alzheimer\'s Disease',
          sample_size: 1500,
          data_accessibility: 'Open Access',
          wgs_available: 'Yes',
          imaging_types: 'MRI, PET, DTI',
          modalities: '["MRI", "PET", "DTI", "WGS", "CSF"]'
        },
        {
          id: 2,
          name: 'AMP-AD - Accelerating Medicines Partnership',
          description: 'Public-private partnership focused on identifying and validating promising biological targets for Alzheimer\'s disease therapeutics.',
          disease_type: 'Alzheimer\'s Disease',
          sample_size: 2000,
          data_accessibility: 'Controlled Access',
          wgs_available: 'Yes',
          imaging_types: 'MRI, PET',
          modalities: '["MRI", "PET", "WGS", "RNA-seq", "Proteomics"]'
        },
        {
          id: 3,
          name: 'NACC - National Alzheimer\'s Coordinating Center',
          description: 'Uniform Data Set (UDS) containing clinical and neuropathological data from Alzheimer\'s Disease Centers.',
          disease_type: 'Mixed Dementia',
          sample_size: 3500,
          data_accessibility: 'Restricted Access',
          wgs_available: 'No',
          imaging_types: 'MRI',
          modalities: '["Clinical", "Neuropsychological", "MRI"]'
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    updateSearchParams();
    fetchDatasets();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDiseaseType('');
    setSelectedModality('');
    setCurrentPage(1);
    setSearchParams({});
    fetchDatasets();
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedDiseaseType) params.set('disease_type', selectedDiseaseType);
    if (selectedModality) params.set('modality', selectedModality);
    setSearchParams(params);
  };

  const parseModalities = (modalitiesString?: string): string[] => {
    if (!modalitiesString) return [];
    try {
      return JSON.parse(modalitiesString);
    } catch {
      return modalitiesString.split(',').map(m => m.trim());
    }
  };

  const getAccessibilityColor = (accessibility: string) => {
    switch (accessibility.toLowerCase()) {
      case 'open access': return 'success';
      case 'controlled access': return 'warning';
      case 'restricted access': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
          Research Datasets
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Explore comprehensive ADRD research datasets with advanced filtering and search capabilities
        </Typography>

        {/* Filters */}
        <Accordion 
          expanded={filtersExpanded} 
          onChange={(_, isExpanded) => setFiltersExpanded(isExpanded)}
          sx={{ mb: 3 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <Typography variant="h6">Filters & Search</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Datasets"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter dataset name..."
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Disease Type</InputLabel>
                  <Select
                    value={selectedDiseaseType}
                    label="Disease Type"
                    onChange={(e) => setSelectedDiseaseType(e.target.value)}
                  >
                    <MenuItem value="">All Disease Types</MenuItem>
                    {filterOptions.disease_types.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Data Modality</InputLabel>
                  <Select
                    value={selectedModality}
                    label="Data Modality"
                    onChange={(e) => setSelectedModality(e.target.value)}
                  >
                    <MenuItem value="">All Modalities</MenuItem>
                    {filterOptions.modalities.map((modality) => (
                      <MenuItem key={modality} value={modality}>{modality}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    startIcon={<Search />}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                  >
                    Clear All
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Results */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Found {datasets.length} datasets
        </Typography>
      </Box>

      {/* Dataset Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {datasets.map((dataset) => (
          <Grid item xs={12} md={6} lg={4} key={dataset.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease-in-out',
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <DatasetIcon sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, flex: 1 }}>
                    {dataset.name}
                  </Typography>
                </Box>

                <Typography color="text.secondary" sx={{ mb: 2, minHeight: '60px' }}>
                  {dataset.description || 'No description available'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={dataset.disease_type}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1, mr: 1 }}
                  />
                  <Chip
                    label={dataset.data_accessibility}
                    color={getAccessibilityColor(dataset.data_accessibility) as any}
                    variant="outlined"
                    size="small"
                    icon={dataset.data_accessibility.toLowerCase().includes('open') ? <LockOpen /> : <Lock />}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Sample Size: {dataset.sample_size?.toLocaleString() || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Science sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    WGS Available: {dataset.wgs_available || 'N/A'}
                  </Typography>
                </Box>

                {/* Modalities */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Data Modalities:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {parseModalities(dataset.modalities).map((modality, index) => (
                      <Chip
                        key={index}
                        label={modality}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {datasets.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <DatasetIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
            No datasets found
          </Typography>
          <Typography color="text.secondary">
            Try adjusting your search criteria or clearing the filters
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default DatasetsPage;
