import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  AccountTree,
  Construction,
  DataObject,
  Hub,
  Timeline,
} from '@mui/icons-material';

const KnowledgeGraphPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
          Knowledge Graph
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: '800px', mx: 'auto' }}>
          Interactive visualization and exploration of relationships between ADRD datasets, publications, 
          researchers, and biological entities
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          🚧 Coming Soon
        </Typography>
        The Knowledge Graph feature is currently under development. This will provide an interactive 
        network visualization showing connections between datasets, publications, research institutions, 
        and biological entities in the ADRD research ecosystem.
      </Alert>

      {/* Planned Features */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
        Planned Features
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountTree sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Interactive Network Visualization
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Explore complex relationships between datasets, publications, researchers, and institutions 
                through an interactive network graph with zoom, pan, and filtering capabilities.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataObject sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Entity Relationships
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Discover connections between genes, proteins, pathways, and phenotypes across different 
                datasets, enabling cross-study analysis and hypothesis generation.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Hub sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Collaborative Networks
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Visualize research collaboration patterns, identify key researchers and institutions, 
                and discover potential collaboration opportunities in the ADRD field.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Temporal Analysis
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Track the evolution of research topics, dataset development, and publication trends 
                over time to identify emerging areas and research gaps.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Technical Details */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Construction sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Technical Implementation
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Data Sources
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" sx={{ mb: 1 }}>
                  Dataset metadata and relationships
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Publication abstracts and citations
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Author affiliations and collaborations
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Biological entity annotations (genes, proteins, pathways)
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Technologies
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" sx={{ mb: 1 }}>
                  Neo4j graph database for data storage
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  D3.js for interactive visualizations
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Natural Language Processing for entity extraction
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Graph algorithms for relationship discovery
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Stay Updated
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
          The Knowledge Graph will be a powerful tool for discovering hidden connections in ADRD research. 
          Check back soon for updates on the development progress.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/datasets'}
            sx={{ px: 4 }}
          >
            Explore Datasets
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/publications'}
            sx={{ px: 4 }}
          >
            Browse Publications
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default KnowledgeGraphPage;
