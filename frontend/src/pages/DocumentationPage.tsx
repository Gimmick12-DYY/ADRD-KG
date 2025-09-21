import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Link,
  Chip,
} from '@mui/material';
import {
  Description,
  ExpandMore,
  Code,
  Api,
  Storage,
  Security,
  Help,
  GetApp,
} from '@mui/icons-material';

const DocumentationPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
          Documentation
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: '800px', mx: 'auto' }}>
          Comprehensive guide to using the ADRD Knowledge Graph platform, API documentation, 
          and data access procedures
        </Typography>
      </Box>

      {/* Quick Start */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Help sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Quick Start Guide
            </Typography>
          </Box>
          
          <Typography sx={{ mb: 3 }}>
            Welcome to the ADRD Knowledge Graph! This platform provides access to comprehensive 
            information about Alzheimer's Disease and Related Dementia research datasets and publications.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  1. Explore Datasets
                </Typography>
                <Typography color="text.secondary">
                  Browse through our curated collection of ADRD research datasets with advanced filtering options.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  2. Search Publications
                </Typography>
                <Typography color="text.secondary">
                  Find relevant research papers and publications linked to specific datasets.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  3. Access Data
                </Typography>
                <Typography color="text.secondary">
                  Follow the data access procedures to obtain datasets for your research.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Api sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">API Documentation</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 3 }}>
            The ADRD Knowledge Graph provides a RESTful API for programmatic access to datasets and publications.
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Base URL
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 3, fontFamily: 'monospace' }}>
            http://localhost:5000/api
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Endpoints
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              GET /datasets
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Retrieve datasets with optional filtering parameters.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Parameters:</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">disease_type - Filter by disease type</Typography>
              <Typography component="li" variant="body2">modality - Filter by data modality</Typography>
              <Typography component="li" variant="body2">search - Search dataset names</Typography>
              <Typography component="li" variant="body2">page - Page number (default: 1)</Typography>
              <Typography component="li" variant="body2">per_page - Results per page (default: 10)</Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              GET /publications
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Retrieve publications with optional filtering parameters.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Parameters:</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">dataset_name - Filter by associated dataset</Typography>
              <Typography component="li" variant="body2">title_search - Search publication titles</Typography>
              <Typography component="li" variant="body2">year - Filter by publication year</Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              GET /stats
            </Typography>
            <Typography>
              Get summary statistics including total datasets, publications, and disease distribution.
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Data Access */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Storage sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Data Access Procedures</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 3 }}>
            Access to ADRD research datasets varies depending on the data type and repository policies.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'success.50' }}>
                <CardContent>
                  <Chip label="Open Access" color="success" sx={{ mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Freely Available
                  </Typography>
                  <Typography>
                    No registration required. Data can be downloaded directly from the source repository.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'warning.50' }}>
                <CardContent>
                  <Chip label="Controlled Access" color="warning" sx={{ mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Registration Required
                  </Typography>
                  <Typography>
                    Requires user registration and acceptance of data use agreements. 
                    Access typically granted within 1-2 weeks.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'error.50' }}>
                <CardContent>
                  <Chip label="Restricted Access" color="error" sx={{ mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Application Required
                  </Typography>
                  <Typography>
                    Requires formal application with research proposal and institutional approval. 
                    Review process may take several weeks.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Data Standards */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Code sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Data Standards & Formats</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 3 }}>
            The ADRD Knowledge Graph follows established standards for data representation and interoperability.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Supported File Formats
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">CSV - Tabular data</Typography>
                <Typography component="li">JSON - Structured metadata</Typography>
                <Typography component="li">NIfTI - Neuroimaging data</Typography>
                <Typography component="li">DICOM - Medical imaging</Typography>
                <Typography component="li">VCF - Genomic variants</Typography>
                <Typography component="li">FASTA - Sequence data</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Metadata Standards
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">FAIR Data Principles</Typography>
                <Typography component="li">Dublin Core Metadata</Typography>
                <Typography component="li">BIDS - Brain Imaging Data Structure</Typography>
                <Typography component="li">HL7 FHIR - Healthcare data exchange</Typography>
                <Typography component="li">OMOP CDM - Observational health data</Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Privacy & Security */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Privacy & Security</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 3 }}>
            We are committed to protecting participant privacy and ensuring secure data handling practices.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Data Protection Measures
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">De-identification of personal data</Typography>
                <Typography component="li">Secure data transmission (HTTPS/TLS)</Typography>
                <Typography component="li">Access controls and authentication</Typography>
                <Typography component="li">Audit logging and monitoring</Typography>
                <Typography component="li">Regular security assessments</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Compliance Standards
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">HIPAA - Health Insurance Portability and Accountability Act</Typography>
                <Typography component="li">GDPR - General Data Protection Regulation</Typography>
                <Typography component="li">IRB - Institutional Review Board approval</Typography>
                <Typography component="li">NIH Data Sharing Guidelines</Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Contact & Support */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <GetApp sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Contact & Support
            </Typography>
          </Box>
          
          <Typography sx={{ mb: 3 }}>
            Need help or have questions about the ADRD Knowledge Graph? We're here to assist you.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Technical Support
              </Typography>
              <Typography sx={{ mb: 1 }}>
                For technical issues, API questions, or data access problems:
              </Typography>
              <Link href="mailto:support@adrd-kg.org" sx={{ display: 'block', mb: 2 }}>
                support@adrd-kg.org
              </Link>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Research Collaboration
              </Typography>
              <Typography sx={{ mb: 1 }}>
                For research partnerships and collaboration opportunities:
              </Typography>
              <Link href="mailto:research@adrd-kg.org" sx={{ display: 'block', mb: 2 }}>
                research@adrd-kg.org
              </Link>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DocumentationPage;
