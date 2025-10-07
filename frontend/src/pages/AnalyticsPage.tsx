import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts';
import { apiService, type AnalyticsOverview } from '../services/api';

// Enhanced color palette with better contrast and accessibility
const COLORS = [
  '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688',
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#E91E63', '#9E9E9E', '#607D8B'
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper', boxShadow: 3 }}>
        <Typography variant="body2" color="text.primary">
          {label}
        </Typography>
        <Typography variant="body2" color="primary">
          Count: {payload[0].value}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAnalyticsOverview();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
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

  if (!analytics) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 2 }}>
          No analytics data available
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #9C27B0, #673AB7)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Comprehensive overview of ADRD research data
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>


      {/* Enhanced Charts Section - Bigger and Better Aligned */}
      <Grid container spacing={4} justifyContent="center">
        {/* Disease Distribution - Full width, bigger */}
        <Grid size={{xs: 12}}>
          <Card sx={{ height: '100%', boxShadow: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main', 
                textAlign: 'center',
                mb: 4
              }}>
                Disease Type Distribution
              </Typography>
              <Box sx={{ height: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.disease_distribution.slice(0, 10)} // Show top 10
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={180}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ disease_type, count }) => 
                        `${disease_type.length > 20 ? disease_type.substring(0, 20) + '...' : disease_type}: ${count}`
                      }
                    >
                      {analytics.disease_distribution.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={<CustomTooltip />}
                      wrapperStyle={{ fontSize: '14px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={60}
                      iconType="circle"
                      formatter={(value, entry) => (
                        <span style={{ 
                          color: entry.color, 
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {value.length > 25 ? value.substring(0, 25) + '...' : value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {analytics.disease_distribution.length > 10 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Chip 
                    label={`+${analytics.disease_distribution.length - 10} more disease types`}
                    color="secondary"
                    variant="outlined"
                    sx={{ fontSize: '14px', fontWeight: 'bold' }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Data Accessibility - Full width, bigger */}
        <Grid size={{xs: 12}}>
          <Card sx={{ height: '100%', boxShadow: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main', 
                textAlign: 'center',
                mb: 4
              }}>
                Data Accessibility
              </Typography>
              <Box sx={{ height: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.data_accessibility} margin={{ top: 40, right: 50, left: 40, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="accessibility" 
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      fontSize={14}
                      fontWeight="bold"
                    />
                    <YAxis fontSize={14} fontWeight="bold" />
                    <Tooltip 
                      content={<CustomTooltip />}
                      wrapperStyle={{ fontSize: '14px' }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="url(#colorGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#673AB7" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* WGS Availability - Full width, bigger */}
        <Grid size={{xs: 12}}>
          <Card sx={{ height: '100%', boxShadow: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main', 
                textAlign: 'center',
                mb: 4
              }}>
                WGS Data Availability
              </Typography>
              <Box sx={{ height: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.wgs_availability}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={180}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ availability, count }) => 
                        `${availability.length > 20 ? availability.substring(0, 20) + '...' : availability}: ${count}`
                      }
                    >
                      {analytics.wgs_availability.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={<CustomTooltip />}
                      wrapperStyle={{ fontSize: '14px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={60}
                      iconType="circle"
                      formatter={(value, entry) => (
                        <span style={{ 
                          color: entry.color, 
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {value.length > 25 ? value.substring(0, 25) + '...' : value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </Container>
  );
};

export default AnalyticsPage;
