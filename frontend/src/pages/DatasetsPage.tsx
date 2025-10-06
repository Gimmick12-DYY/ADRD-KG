import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Pagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Visibility,
} from '@mui/icons-material';
import { apiService, type Dataset, type Publication } from '../services/api';

const DatasetsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [availableFilters, setAvailableFilters] = useState<any>({});
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [datasetPublications, setDatasetPublications] = useState<Publication[]>([]);
  const [publicationsDialogOpen, setPublicationsDialogOpen] = useState(false);

  useEffect(() => {
    fetchFilters();
    fetchDatasets();
  }, [page, filters, searchQuery]);

  const fetchFilters = async () => {
    try {
      const data = await apiService.getFilters();
      setAvailableFilters(data);
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery,
        page,
        per_page: 6, // This place set the max number of datasets to be displayed
      };
      const data = await apiService.getDatasets(params);
      setDatasets(data.datasets);
      setTotalPages(data.pages);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch datasets');
      console.error('Error fetching datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchDatasets();
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [filterName]: value || undefined,
    }));
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const data = await apiService.exportDatasets();
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'adrd_datasets.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleViewPublications = async (dataset: Dataset) => {
    try {
      const data = await apiService.getDatasetPublications(dataset.id);
      setSelectedDataset(dataset);
      setDatasetPublications(data.publications);
      setPublicationsDialogOpen(true);
    } catch (err) {
      console.error('Error fetching publications:', err);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  if (loading && datasets.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Datasets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore and search through ADRD research datasets
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{xs: 12, sm:6, md:3}}>
              <TextField
                fullWidth
                label="Search datasets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            
            <Grid size={{xs: 12, sm:6, md:2}}>
              <FormControl fullWidth>
                <InputLabel>Disease Type</InputLabel>
                <Select
                  value={filters.disease_type || ''}
                  onChange={(e) => handleFilterChange('disease_type', e.target.value)}
                  label="Disease Type"
                >
                  <MenuItem value="">All</MenuItem>
                  {availableFilters.disease_types?.map((type: string) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{xs: 12, sm:6, md:2}}>
              <FormControl fullWidth>
                <InputLabel>Modality</InputLabel>
                <Select
                  value={filters.modality || ''}
                  onChange={(e) => handleFilterChange('modality', e.target.value)}
                  label="Modality"
                >
                  <MenuItem value="">All</MenuItem>
                  {availableFilters.modalities?.map((modality: string) => (
                    <MenuItem key={modality} value={modality}>{modality}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{xs: 12, sm:6, md:2}}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<Search />}
                fullWidth
              >
                Search
              </Button>
            </Grid>

            <Grid size={{xs: 12, sm:6, md:2}}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<FilterList />}
                fullWidth
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {total} datasets found
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </Box>

      {/* Datasets Grid */}
      <Grid container spacing={3}>
        {datasets.map((dataset) => (
          <Grid size={{xs: 12, sm: 6, md: 4}} key={dataset.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '400px' // Ensure minimum height for consistency
            }}>
              <CardContent sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                pb: 1
              }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ 
                  minHeight: '48px', // Ensure title area has consistent height
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {dataset.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 2, 
                  flexGrow: 1,
                  minHeight: '60px', // Ensure description area has consistent height
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {dataset.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, minHeight: '32px' }}>
                  {dataset.disease_type && (
                    <Chip label={dataset.disease_type} size="small" color="primary" />
                  )}
                  {dataset.sample_size && (
                    <Chip label={`n=${dataset.sample_size}`} size="small" variant="outlined" />
                  )}
                  {dataset.data_accessibility && (
                    <Chip label={dataset.data_accessibility} size="small" color="secondary" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, minHeight: '32px' }}>
                  {dataset.wgs_available && (
                    <Chip label={`WGS: ${dataset.wgs_available}`} size="small" color="info" />
                  )}
                </Box>

                {dataset.imaging_types && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{
                    minHeight: '20px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    Imaging: {dataset.imaging_types}
                  </Typography>
                )}
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleViewPublications(dataset)}
                  fullWidth
                >
                  View Publications
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Publications Dialog */}
      <Dialog
        open={publicationsDialogOpen}
        onClose={() => setPublicationsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Publications for {selectedDataset?.name}
        </DialogTitle>
        <DialogContent>
          {datasetPublications.length > 0 ? (
            <List>
              {datasetPublications.map((publication) => (
                <ListItem key={publication.id} divider>
                  <ListItemText
                    primary={publication.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {publication.authors}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {publication.journal} ({publication.year})
                        </Typography>
                        {publication.doi && (
                          <Typography variant="caption" color="primary">
                            DOI: {publication.doi}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              No publications found for this dataset.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublicationsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DatasetsPage;
