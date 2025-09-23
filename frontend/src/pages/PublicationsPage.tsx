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
  Link,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  OpenInNew,
} from '@mui/icons-material';
import { apiService, type Publication } from '../services/api';

const PublicationsPage: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPublications();
  }, [page, filters, searchQuery]);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        title_search: searchQuery,
        page,
        per_page: 10,
      };
      const data = await apiService.getPublications(params);
      setPublications(data.publications);
      setTotalPages(data.pages);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch publications');
      console.error('Error fetching publications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPublications();
  };

  const handleFilterChange = (filterName: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value || undefined,
    }));
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const data = await apiService.exportPublications();
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'adrd_publications.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1990; year--) {
      years.push(year);
    }
    return years;
  };

  if (loading && publications.length === 0) {
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
          📚 Publications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and search through ADRD research publications
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
            <Grid xs={12} md={3}>
              <TextField
                fullWidth
                label="Search publications"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            
            <Grid xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={filters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  label="Year"
                >
                  <MenuItem value="">All Years</MenuItem>
                  {generateYears().map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={12} md={2}>
              <TextField
                fullWidth
                label="Dataset Name"
                value={filters.dataset_name || ''}
                onChange={(e) => handleFilterChange('dataset_name', e.target.value)}
              />
            </Grid>

            <Grid xs={12} md={2}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<Search />}
                fullWidth
              >
                Search
              </Button>
            </Grid>

            <Grid xs={12} md={2}>
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
          {total} publications found
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </Box>

      {/* Publications List */}
      <Grid container spacing={3}>
        {publications.map((publication) => (
          <Grid xs={12} key={publication.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {publication.title}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {publication.authors}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {publication.journal && (
                    <Chip label={publication.journal} size="small" color="primary" />
                  )}
                  {publication.year && (
                    <Chip label={publication.year} size="small" variant="outlined" />
                  )}
                  {publication.dataset_name && (
                    <Chip label={publication.dataset_name} size="small" color="secondary" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {publication.doi && (
                    <Link
                      href={`https://doi.org/${publication.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <OpenInNew fontSize="small" />
                      DOI: {publication.doi}
                    </Link>
                  )}
                  {publication.pmid && (
                    <Link
                      href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <OpenInNew fontSize="small" />
                      PMID: {publication.pmid}
                    </Link>
                  )}
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
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default PublicationsPage;
