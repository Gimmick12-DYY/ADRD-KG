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
  Button,
  Pagination,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Link,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  ExpandMore,
  Article,
  OpenInNew,
  CalendarToday,
  School,
} from '@mui/icons-material';
import apiService, { Publication } from '../services/apiService';

const PublicationsPage: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [titleSearch, setTitleSearch] = useState('');
  const [datasetFilter, setDatasetFilter] = useState('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Available years for filter (could be fetched from API)
  const availableYears = Array.from({ length: 15 }, (_, i) => 2024 - i);

  useEffect(() => {
    fetchPublications();
  }, [currentPage, titleSearch, datasetFilter, yearFilter]);

  const fetchPublications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        ...(titleSearch && { title_search: titleSearch }),
        ...(datasetFilter && { dataset_name: datasetFilter }),
        ...(yearFilter && { year: yearFilter as number }),
      };

      const response = await apiService.getPublications(params);
      setPublications(response.publications);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching publications:', error);
      setError('Failed to load publications. Showing mock data for demonstration.');
      
      // Mock data for demonstration
      setPublications([
        {
          id: 1,
          title: 'Alzheimer\'s disease neuroimaging initiative: progress report and future plans',
          authors: 'Weiner MW, Veitch DP, Aisen PS, Beckett LA, Cairns NJ, Green RC, Harvey D, Jack CR Jr, Jagust W, Morris JC, Petersen RC, Saykin AJ, Shaw LM, Toga AW, Trojanowski JQ',
          journal: 'Alzheimer\'s & Dementia',
          year: 2023,
          pmid: '12345678',
          doi: '10.1016/j.jalz.2023.01.001',
          dataset_name: 'ADNI'
        },
        {
          id: 2,
          title: 'Multi-omics analysis reveals molecular mechanisms of Alzheimer\'s disease progression',
          authors: 'Johnson AB, Smith CD, Williams EF, Brown GH, Davis IJ, Miller KL',
          journal: 'Nature Neuroscience',
          year: 2023,
          pmid: '23456789',
          doi: '10.1038/s41593-023-01234-5',
          dataset_name: 'AMP-AD'
        },
        {
          id: 3,
          title: 'Longitudinal cognitive decline patterns in preclinical Alzheimer\'s disease',
          authors: 'Anderson MN, Thompson OP, Garcia QR, Wilson ST, Lee UV',
          journal: 'Journal of Alzheimer\'s Disease',
          year: 2022,
          pmid: '34567890',
          doi: '10.3233/JAD-220123',
          dataset_name: 'NACC'
        },
        {
          id: 4,
          title: 'Genetic variants associated with resilience to Alzheimer\'s disease pathology',
          authors: 'Martinez XY, Rodriguez ZA, Kim BC, Patel DE, Taylor FG',
          journal: 'Science Translational Medicine',
          year: 2022,
          pmid: '45678901',
          doi: '10.1126/scitranslmed.abc1234',
          dataset_name: 'ADNI'
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPublications();
  };

  const handleClearFilters = () => {
    setTitleSearch('');
    setDatasetFilter('');
    setYearFilter('');
    setCurrentPage(1);
    fetchPublications();
  };

  const formatAuthors = (authors?: string, maxLength: number = 100) => {
    if (!authors) return 'No authors listed';
    if (authors.length <= maxLength) return authors;
    return authors.substring(0, maxLength) + '...';
  };

  const getJournalColor = (journal?: string) => {
    if (!journal) return 'default';
    const journalLower = journal.toLowerCase();
    if (journalLower.includes('nature')) return 'success';
    if (journalLower.includes('science')) return 'info';
    if (journalLower.includes('alzheimer')) return 'primary';
    return 'secondary';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
          Research Publications
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Explore peer-reviewed publications linked to ADRD research datasets
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
                  label="Search Publications"
                  value={titleSearch}
                  onChange={(e) => setTitleSearch(e.target.value)}
                  placeholder="Enter title keywords..."
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Dataset Name"
                  value={datasetFilter}
                  onChange={(e) => setDatasetFilter(e.target.value)}
                  placeholder="e.g., ADNI, AMP-AD..."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Publication Year</InputLabel>
                  <Select
                    value={yearFilter}
                    label="Publication Year"
                    onChange={(e) => setYearFilter(e.target.value as number | '')}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {availableYears.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
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
          Found {publications.length} publications
        </Typography>
      </Box>

      {/* Publication Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {publications.map((publication) => (
          <Grid item xs={12} key={publication.id}>
            <Card 
              sx={{ 
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.3s ease-in-out',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Article sx={{ color: 'primary.main', mr: 2, mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        lineHeight: 1.3,
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      {publication.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {publication.year && (
                        <Chip
                          icon={<CalendarToday />}
                          label={publication.year}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                      {publication.journal && (
                        <Chip
                          icon={<School />}
                          label={publication.journal}
                          size="small"
                          variant="outlined"
                          color={getJournalColor(publication.journal) as any}
                        />
                      )}
                      {publication.dataset_name && (
                        <Chip
                          label={`Dataset: ${publication.dataset_name}`}
                          size="small"
                          variant="filled"
                          color="secondary"
                        />
                      )}
                    </Box>

                    <Typography 
                      color="text.secondary" 
                      sx={{ mb: 2, fontStyle: 'italic' }}
                    >
                      {formatAuthors(publication.authors)}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {publication.pmid && (
                        <Link
                          href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          PubMed: {publication.pmid}
                          <OpenInNew fontSize="small" />
                        </Link>
                      )}
                      {publication.doi && (
                        <Link
                          href={`https://doi.org/${publication.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          DOI: {publication.doi}
                          <OpenInNew fontSize="small" />
                        </Link>
                      )}
                    </Box>
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

      {publications.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Article sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
            No publications found
          </Typography>
          <Typography color="text.secondary">
            Try adjusting your search criteria or clearing the filters
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default PublicationsPage;
