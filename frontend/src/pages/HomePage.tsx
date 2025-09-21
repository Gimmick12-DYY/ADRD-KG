import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Dataset,
  Article,
  TrendingUp,
  Science,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import apiService from '../services/apiService';

interface Stats {
  total_datasets: number;
  total_publications: number;
  disease_distribution: Array<{ disease_type: string; count: number }>;
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set mock data for demonstration
        setStats({
          total_datasets: 125,
          total_publications: 1847,
          disease_distribution: [
            { disease_type: 'Alzheimer\'s Disease', count: 45 },
            { disease_type: 'Mixed Dementia', count: 32 },
            { disease_type: 'Frontotemporal Dementia', count: 28 },
            { disease_type: 'Lewy Body Disease', count: 20 },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#004c97', '#8E7DBE', '#B6A6CA', '#9CB4CC', '#748DA6', '#6B85A3'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
        <Typography>Loading ADRD Knowledge Graph...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            mb: 2, 
            color: 'primary.main',
            fontWeight: 700,
          }}
        >
          ADRD Knowledge Graph
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            color: 'text.secondary',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          Comprehensive information sharing platform for Alzheimer's Disease and Related Dementia research datasets
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Dataset />}
            onClick={() => navigate('/datasets')}
            sx={{ px: 4, py: 1.5 }}
          >
            Explore Datasets
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Article />}
            onClick={() => navigate('/publications')}
            sx={{ px: 4, py: 1.5 }}
          >
            Browse Publications
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Dataset sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats?.total_datasets || 0}
              </Typography>
              <Typography color="text.secondary">
                Research Datasets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Article sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                {stats?.total_publications || 0}
              </Typography>
              <Typography color="text.secondary">
                Publications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Science sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'success.main' }}>
                15+
              </Typography>
              <Typography color="text.secondary">
                Data Modalities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'warning.main' }}>
                50K+
              </Typography>
              <Typography color="text.secondary">
                Research Participants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Disease Distribution Chart */}
      {stats?.disease_distribution && stats.disease_distribution.length > 0 && (
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '400px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Dataset Distribution by Disease Type
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.disease_distribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ disease_type, percent }) => 
                        `${disease_type}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stats.disease_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '400px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Dataset Counts by Disease Type
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.disease_distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="disease_type" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#004c97" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Key Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
          Key Features
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Dataset sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Comprehensive Dataset Catalog
                </Typography>
                <Typography color="text.secondary">
                  Explore a curated collection of ADRD research datasets with detailed metadata, 
                  accessibility information, and data modalities.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Article sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Publication Database
                </Typography>
                <Typography color="text.secondary">
                  Access linked publications and research papers associated with each dataset, 
                  including PubMed references and DOI links.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Advanced Filtering
                </Typography>
                <Typography color="text.secondary">
                  Filter datasets by disease type, data modality, sample size, and accessibility 
                  to find exactly what you need for your research.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Data Modalities */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Available Data Modalities
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {[
            'MRI', 'fMRI', 'PET', 'DTI', 'ASL', 'SNP Genotyping', 
            'WGS', 'WES', 'RNA-seq', 'Epigenomics', 'Proteomics', 
            'Metabolomics', 'EHR', 'Clinical Cognitive Tests'
          ].map((modality) => (
            <Chip
              key={modality}
              label={modality}
              variant="outlined"
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
