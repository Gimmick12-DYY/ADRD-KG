import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';

const ContributionPage: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      setUploadStatus('error');
      setUploadMessage('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    setUploadStatus('uploading');
    
    try {
      // Import apiService
      const { apiService } = await import('../services/api');
      
      // Upload file to backend
      const result = await apiService.uploadFile(file, '');
      
      setUploadStatus('success');
      setUploadMessage('File uploaded successfully! Your submission is pending review by an administrator.');
    } catch (error: any) {
      setUploadStatus('error');
      setUploadMessage(error.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contribute
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share your ADRD research datasets with the community
        </Typography>
      </Box>

      {/* Upload Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Your Dataset
          </Typography>
          
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUpload />}
                size="large"
                disabled={uploadStatus === 'uploading'}
                sx={{ mb: 2 }}
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Choose File'}
              </Button>
            </label>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Supported formats: CSV, Excel (.xlsx, .xls)
            </Typography>
          </Box>

          {uploadStatus !== 'idle' && (
            <Alert 
              severity={uploadStatus === 'success' ? 'success' : uploadStatus === 'error' ? 'error' : 'info'}
              sx={{ mt: 2 }}
            >
              {uploadMessage}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Grid container spacing={3}>
        <Grid>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                IMPORTANT: Required Data Format
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your dataset should include the following columns:
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dataset Name" 
                    secondary="Name of your dataset (required)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Description" 
                    secondary="Brief description of the dataset"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Disease Type" 
                    secondary="e.g., AD, LBD, FTD, VaD, Mixed"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sample Size" 
                    secondary="Number of observations/participants"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Data Accessibility" 
                    secondary="How to access the data"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Optional Fields
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="WGS Available" 
                    secondary="Whole Genome Sequencing availability"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Imaging Types" 
                    secondary="Available imaging modalities"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Info color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Modalities" 
                    secondary="Data types (MRI, PET, etc.)"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Example Format */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example CSV Format
          </Typography>
          
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`Dataset Name,Description,Disease Type,Sample Size,Data Accessibility,WGS Available,Imaging Types,Modalities
"ADNI Dataset","Alzheimer's Disease Neuroimaging Initiative","AD",1500,"Open Access","Yes","MRI, PET","MRI, PET, Cognitive Tests"
"PPMI Study","Parkinson's Progression Markers Initiative","PD",800,"Controlled Access","No","MRI, DaTscan","MRI, Clinical Assessments"
"FTD Registry","Frontotemporal Dementia Registry","FTD",300,"Research Only","Yes","MRI","MRI, Genetic Testing"`}
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ⚠️ Submission Guidelines
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Warning color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Data Privacy" 
                secondary="Ensure your dataset complies with privacy regulations and has proper consent for sharing"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Data Quality" 
                secondary="Please verify data accuracy and completeness before submission"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Documentation" 
                secondary="Include clear descriptions and methodology information when possible"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ContributionPage;
