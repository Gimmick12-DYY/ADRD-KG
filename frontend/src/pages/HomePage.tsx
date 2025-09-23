import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Storage,
  Article,
  TrendingUp,
  Download,
} from '@mui/icons-material';
import { apiService, type Dataset, type Publication } from '../services/api';

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentDatasets, setRecentDatasets] = useState<Dataset[]>([]);
  const [recentPublications, setRecentPublications] = useState<Publication[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Test backend connection
        await apiService.healthCheck();
        
        // Fetch all data in parallel
        const [statsData, datasetsData, publicationsData] = await Promise.all([
          apiService.getStats(),
          apiService.getRecentDatasets(3),
          apiService.getRecentPublications(3),
        ]);

        setStats(statsData);
        setRecentDatasets(datasetsData.datasets);
        setRecentPublications(publicationsData.publications);
        setError(null);
      } catch (err) {
        setError('Failed to connect to backend. Please make sure the server is running.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = async (type: 'datasets' | 'publications') => {
    try {
      const data = type === 'datasets' 
        ? await apiService.exportDatasets()
        : await apiService.exportPublications();
      
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adrd_${type}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Welcome to ADRD-KG
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Exploring Alzheimer's Disease and Related Dementias Research Datasets
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Storage color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.total_datasets || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Datasets
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Article color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.total_publications || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Publications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats?.disease_distribution?.length || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Disease Types
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Download color="info" sx={{ mr: 2 }} />
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleExport('datasets')}
                    sx={{ mb: 1 }}
                  >
                    Export Data
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    CSV Download
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Data */}
      <Grid container spacing={3}>
        <Grid>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Datasets
              </Typography>
              {recentDatasets.length > 0 ? (
                recentDatasets.map((dataset) => (
                  <Box key={dataset.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {dataset.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {dataset.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {dataset.disease_type && (
                        <Chip label={dataset.disease_type} size="small" color="primary" />
                      )}
                      {dataset.sample_size && (
                        <Chip label={`n=${dataset.sample_size}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No datasets available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Publications
              </Typography>
              {recentPublications.length > 0 ? (
                recentPublications.map((publication) => (
                  <Box key={publication.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {publication.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {publication.authors}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {publication.journal && (
                        <Chip label={publication.journal} size="small" color="secondary" />
                      )}
                      {publication.year && (
                        <Chip label={publication.year} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No publications available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
