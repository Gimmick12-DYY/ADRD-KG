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
  Paper,
  useTheme,
} from '@mui/material';
import {
  Storage,
  Article,
  TrendingUp,
  Download,
  ArrowForward,
  Science,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService, type Dataset, type Publication } from '../services/api';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          position: 'relative',
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 6, md: 10 },
          mb: 6,
          borderRadius: 0,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        {/* Abstract Background Pattern */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 20% 150%, white 0%, transparent 50%), radial-gradient(circle at 80% -50%, white 0%, transparent 50%)',
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{xs: 12, md: 8}}>
              <Typography variant="overline" sx={{ fontWeight: 600, letterSpacing: 2, color: 'rgba(255,255,255,0.8)' }}>
                ALZHEIMER'S DISEASE RESEARCH
              </Typography>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-1px' }}>
                ADRD Knowledge Graph
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', fontWeight: 400, maxWidth: 600 }}>
                A comprehensive atlas for exploring, sharing, and analyzing research datasets and publications related to Alzheimer's Disease and Related Dementias.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  startIcon={<Storage />}
                  onClick={() => navigate('/datasets')}
                  sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
                >
                  Browse Datasets
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    px: 4, 
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                  startIcon={<Science />}
                  onClick={() => navigate('/publications')}
                >
                  View Publications
                </Button>
              </Box>
            </Grid>
            <Grid size={{xs: 12, md: 4}} sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'center' }}>
               <Science sx={{ fontSize: 200, opacity: 0.2, color: 'white' }} />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Statistics Cards */}
        <Grid container spacing={3} mb={6}>
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                p: 2, 
                opacity: 0.1, 
                transform: 'translate(20%, -20%)' 
              }}>
                <Storage sx={{ fontSize: 100, color: 'primary.main' }} />
              </Box>
              <CardContent>
                <Typography color="text.secondary" gutterBottom fontWeight={600}>
                  DATASETS
                </Typography>
                <Typography variant="h3" component="div" color="primary.main" fontWeight={700}>
                  {stats?.total_datasets || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Curated research datasets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                p: 2, 
                opacity: 0.1, 
                transform: 'translate(20%, -20%)' 
              }}>
                <Article sx={{ fontSize: 100, color: 'secondary.main' }} />
              </Box>
              <CardContent>
                <Typography color="text.secondary" gutterBottom fontWeight={600}>
                  PUBLICATIONS
                </Typography>
                <Typography variant="h3" component="div" color="secondary.main" fontWeight={700}>
                  {stats?.total_publications || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Indexed peer-reviewed papers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                p: 2, 
                opacity: 0.1, 
                transform: 'translate(20%, -20%)' 
              }}>
                <TrendingUp sx={{ fontSize: 100, color: 'success.main' }} />
              </Box>
              <CardContent>
                <Typography color="text.secondary" gutterBottom fontWeight={600}>
                  DISEASE TYPES
                </Typography>
                <Typography variant="h3" component="div" color="success.main" fontWeight={700}>
                  {stats?.disease_distribution?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Distinct pathologies covered
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{xs: 12, sm: 6, md: 3}}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Download sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                <Typography variant="h6" gutterBottom>
                  Download Data
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                  Get the full catalog in CSV format
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => handleExport('datasets')}
                  startIcon={<Download />}
                >
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Data Sections */}
        <Grid container spacing={4}>
          <Grid size={{xs: 12, md: 6}}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Recent Datasets
              </Typography>
              <Button endIcon={<ArrowForward />} onClick={() => navigate('/datasets')}>
                View All
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentDatasets.length > 0 ? (
                recentDatasets.map((dataset) => (
                  <Card key={dataset.id} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                        {dataset.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {dataset.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {dataset.disease_type && (
                          <Chip label={dataset.disease_type} size="small" sx={{ bgcolor: 'rgba(21, 101, 192, 0.1)', color: 'primary.main', fontWeight: 600 }} />
                        )}
                        {dataset.sample_size && (
                          <Chip label={`n=${dataset.sample_size}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Alert severity="info">No recent datasets available.</Alert>
              )}
            </Box>
          </Grid>

          <Grid size={{xs: 12, md: 6}}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Recent Publications
              </Typography>
              <Button endIcon={<ArrowForward />} onClick={() => navigate('/publications')}>
                View All
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentPublications.length > 0 ? (
                recentPublications.map((publication) => (
                  <Card key={publication.id} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                        {publication.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {publication.authors}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {publication.journal && (
                          <Chip label={publication.journal} size="small" color="secondary" variant="outlined" />
                        )}
                        {publication.year && (
                          <Chip label={publication.year} size="small" sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }} />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Alert severity="info">No recent publications available.</Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
