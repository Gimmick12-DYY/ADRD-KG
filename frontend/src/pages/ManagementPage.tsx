import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Logout,
  Refresh,
  Preview,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

interface PendingUpload {
  id: number;
  file_name: string;
  file_type: string;
  uploaded_by: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes: string;
  reviewed_by: string;
  created_at: string;
  reviewed_at: string | null;
}

interface UploadDetail {
  id: number;
  file_name: string;
  file_type: string;
  file_content: any[];
  uploaded_by: string;
  status: string;
  review_notes: string;
  reviewed_by: string;
  created_at: string;
  reviewed_at: string | null;
}

const ManagementPage: React.FC = () => {
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedUpload, setSelectedUpload] = useState<UploadDetail | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploadCounts, setUploadCounts] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const navigate = useNavigate();

  const username = authService.getUsername();

  useEffect(() => {
    fetchUploads(true); // Force refresh when tab changes
  }, [tabValue]);

  // Fetch counts for all tabs on initial load and when tab changes
  useEffect(() => {
    const fetchAllCounts = async () => {
      try {
        const [pending, approved, rejected, all] = await Promise.all([
          apiService.getPendingUploads('pending').catch(() => ({ uploads: [] })),
          apiService.getPendingUploads('approved').catch(() => ({ uploads: [] })),
          apiService.getPendingUploads('rejected').catch(() => ({ uploads: [] })),
          apiService.getPendingUploads('all').catch(() => ({ uploads: [] })),
        ]);
        setUploadCounts({
          pending: pending.uploads?.length || 0,
          approved: approved.uploads?.length || 0,
          rejected: rejected.uploads?.length || 0,
          all: all.uploads?.length || 0,
        });
      } catch (err) {
        console.error('Error fetching upload counts:', err);
      }
    };
    fetchAllCounts();
  }, [tabValue]); // Re-fetch counts when tab changes

  // Auto-refresh when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing uploads...');
        fetchUploads(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh on focus (user clicks back to the window)
    const handleFocus = () => {
      console.log('Window focused, refreshing uploads...');
      fetchUploads(true);
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]); // Re-setup listeners when tab changes

  const fetchUploads = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      let status: string;
      if (tabValue === 0) {
        status = 'pending';
      } else if (tabValue === 1) {
        status = 'approved';
      } else if (tabValue === 2) {
        status = 'rejected';
      } else if (tabValue === 3) {
        status = 'all'; // Show all uploads
      } else {
        status = 'pending';
      }
      
      const data = await apiService.getPendingUploads(status);
      console.log(`Fetched ${status} uploads:`, data, `(forceRefresh: ${forceRefresh})`);
      
      // Ensure we have a valid response
      if (!data || typeof data !== 'object') {
        console.warn('Invalid response from API:', data);
        setUploads([]);
        return;
      }
      
      const uploadsList = data.uploads || [];
      console.log(`Setting ${uploadsList.length} uploads for status ${status}`);
      setUploads(uploadsList);
      
      // Update counts when fetching
      if (status === 'pending') {
        setUploadCounts(prev => ({ ...prev, pending: uploadsList.length }));
      } else if (status === 'approved') {
        setUploadCounts(prev => ({ ...prev, approved: uploadsList.length }));
      } else if (status === 'rejected') {
        setUploadCounts(prev => ({ ...prev, rejected: uploadsList.length }));
      } else if (status === 'all') {
        setUploadCounts(prev => ({ ...prev, all: uploadsList.length }));
      }
    } catch (err: any) {
      console.error('Error fetching uploads:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch uploads';
      setError(errorMessage);
      setUploads([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (uploadId: number) => {
    try {
      setLoadingDetail(true);
      setError(null);
      setDetailDialogOpen(true); // Open dialog first to show loading state
      console.log('Fetching upload detail for ID:', uploadId);
      const detail = await apiService.getPendingUploadDetail(uploadId);
      console.log('Received detail:', detail);
      
      // Ensure file_content is parsed if it's a string
      if (detail && detail.file_content) {
        if (typeof detail.file_content === 'string') {
          try {
            detail.file_content = JSON.parse(detail.file_content);
          } catch (e) {
            console.warn('Could not parse file_content as JSON:', e);
            detail.file_content = [];
          }
        }
        // Ensure it's an array
        if (!Array.isArray(detail.file_content)) {
          console.warn('file_content is not an array:', typeof detail.file_content);
          detail.file_content = [];
        }
      } else {
        console.warn('No file_content in detail response');
        detail.file_content = [];
      }
      
      console.log('Processed detail for preview:', {
        id: detail.id,
        file_name: detail.file_name,
        file_type: detail.file_type,
        content_length: detail.file_content?.length || 0,
        first_row: detail.file_content?.[0] || null,
      });
      
      setSelectedUpload(detail);
    } catch (err: any) {
      console.error('Error fetching detail:', err);
      setError(err.message || 'Failed to fetch upload details');
      setDetailDialogOpen(false); // Close dialog on error
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleReview = (uploadId: number, action: 'approve' | 'reject') => {
    setReviewAction(action);
    setReviewNotes('');
    setSelectedUpload(uploads.find(u => u.id === uploadId) as any);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedUpload) return;

    try {
      setProcessing(true);
      setError(null);
      setSuccessMessage(null);
      
      if (reviewAction === 'approve') {
        const result = await apiService.approveUpload(selectedUpload.id, reviewNotes, username || 'admin');
        if (result.success) {
          if (result.added_count && result.added_count > 0) {
            setSuccessMessage(result.message || `Successfully added ${result.added_count} dataset(s) to the database!`);
          } else {
            // If no datasets were added, show error instead
            const errorMsg = result.errors && result.errors.length > 0 
              ? `Failed to add datasets. Errors: ${result.errors.slice(0, 5).join('; ')}${result.errors.length > 5 ? '...' : ''}`
              : result.message || 'Failed to add datasets to database. Please check the file format.';
            setError(errorMsg);
          }
          if (result.errors && result.errors.length > 0) {
            console.warn('Some rows had errors:', result.errors);
            // Show first few errors in console for debugging
            result.errors.slice(0, 10).forEach((err: string, idx: number) => {
              console.warn(`Error ${idx + 1}:`, err);
            });
          }
        } else {
          setError(result.message || 'Failed to approve upload');
        }
      } else {
        await apiService.rejectUpload(selectedUpload.id, reviewNotes, username || 'admin');
        setSuccessMessage('Upload rejected successfully.');
      }
      
      setReviewDialogOpen(false);
      setDetailDialogOpen(false);
      setReviewNotes('');
      
      // Refresh uploads and counts with force refresh
      await fetchUploads(true);
      
      // Also refresh all counts with a small delay to ensure database is updated
      setTimeout(async () => {
        try {
          const [pending, approved, rejected, all] = await Promise.all([
            apiService.getPendingUploads('pending'),
            apiService.getPendingUploads('approved'),
            apiService.getPendingUploads('rejected'),
            apiService.getPendingUploads('all'),
          ]);
          setUploadCounts({
            pending: pending.uploads?.length || 0,
            approved: approved.uploads?.length || 0,
            rejected: rejected.uploads?.length || 0,
            all: all.uploads?.length || 0,
          });
        } catch (err) {
          console.error('Error refreshing counts:', err);
        }
      }, 500);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to process review');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)',
        pb: 4,
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
        <Box
          sx={{
            mb: 4,
            mt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #7207ab 0%, #dc004e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Management Panel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and manage pending file uploads
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`Logged in as: ${username}`}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderWidth: 2,
                '& .MuiChip-label': {
                  px: 2,
                },
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }} 
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      <Card
        elevation={8}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              background: 'linear-gradient(90deg, rgba(114, 7, 171, 0.05) 0%, rgba(220, 0, 78, 0.05) 100%)',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 64,
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label={`Pending (${uploadCounts.pending})`} />
              <Tab label={`Approved (${uploadCounts.approved})`} />
              <Tab label={`Rejected (${uploadCounts.rejected})`} />
              <Tab label={`All (${uploadCounts.all})`} />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, p: 2, pt: 3 }}>
            <Button
              startIcon={<Refresh />}
              onClick={() => fetchUploads(true)}
              disabled={loading}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
              <CircularProgress size={48} sx={{ color: 'primary.main' }} />
            </Box>
          ) : uploads.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <Alert
                severity="info"
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: 28,
                  },
                }}
              >
                No uploads found for this status.
              </Alert>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 0,
                '& .MuiTable-root': {
                  minWidth: 650,
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: 'linear-gradient(90deg, rgba(114, 7, 171, 0.08) 0%, rgba(220, 0, 78, 0.08) 100%)',
                      '& .MuiTableCell-head': {
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: 'text.primary',
                        borderBottom: '2px solid',
                        borderColor: 'divider',
                      },
                    }}
                  >
                    <TableCell>File Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploads.map((upload, index) => (
                    <TableRow
                      key={upload.id}
                      sx={{
                        '&:hover': {
                          background: 'rgba(114, 7, 171, 0.03)',
                          transform: 'scale(1.001)',
                          transition: 'all 0.2s ease',
                        },
                        '& .MuiTableCell-body': {
                          borderBottom: index < uploads.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{upload.file_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={upload.file_type.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 1,
                            background: 'rgba(114, 7, 171, 0.1)',
                            color: 'primary.main',
                          }}
                        />
                      </TableCell>
                      <TableCell>{upload.uploaded_by || 'Anonymous'}</TableCell>
                      <TableCell>
                        <Chip
                          label={upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                          color={getStatusColor(upload.status) as any}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {new Date(upload.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetail(upload.id)}
                            color="primary"
                            title="Preview dataset"
                            sx={{
                              '&:hover': {
                                background: 'rgba(114, 7, 171, 0.1)',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <Preview />
                          </IconButton>
                          {upload.status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleReview(upload.id, 'approve')}
                                color="success"
                                sx={{
                                  '&:hover': {
                                    background: 'rgba(46, 125, 50, 0.1)',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleReview(upload.id, 'reject')}
                                color="error"
                                sx={{
                                  '&:hover': {
                                    background: 'rgba(211, 47, 47, 0.1)',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <Cancel />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog with Enhanced Preview */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedUpload(null);
        }}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(90deg, rgba(114, 7, 171, 0.08) 0%, rgba(220, 0, 78, 0.08) 100%)',
            fontWeight: 700,
            fontSize: '1.25rem',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h6" component="span">
              Dataset Preview: {selectedUpload?.file_name}
            </Typography>
          </Box>
          {selectedUpload && (
            <Chip
              label={selectedUpload.status.charAt(0).toUpperCase() + selectedUpload.status.slice(1)}
              color={getStatusColor(selectedUpload.status) as any}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 3, minHeight: 400, backgroundColor: '#ffffff', overflow: 'auto' }}>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress size={48} sx={{ color: 'primary.main' }} />
            </Box>
          ) : !selectedUpload ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Alert severity="warning">No data available for this upload.</Alert>
            </Box>
          ) : (
            <Box>
              {/* Metadata Section */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(114, 7, 171, 0.03)',
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    File Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedUpload.file_type.toUpperCase()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Uploaded By
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedUpload.uploaded_by || 'Anonymous'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Created At
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(selectedUpload.created_at).toLocaleString()}
                  </Typography>
                </Box>
                {selectedUpload.reviewed_at && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Reviewed At
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(selectedUpload.reviewed_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedUpload.review_notes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Review Notes:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(114, 7, 171, 0.05)',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2">{selectedUpload.review_notes}</Typography>
                  </Paper>
                </Box>
              )}

              {/* Enhanced Dataset Preview */}
              {selectedUpload.file_content && Array.isArray(selectedUpload.file_content) && selectedUpload.file_content.length > 0 ? (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Dataset Preview
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${selectedUpload.file_content.length} total rows`}
                        size="small"
                        sx={{
                          background: 'rgba(114, 7, 171, 0.1)',
                          color: 'primary.main',
                          fontWeight: 600,
                        }}
                      />
                      {selectedUpload.file_content[0] && (
                        <Chip
                          label={`${Object.keys(selectedUpload.file_content[0]).length} columns`}
                          size="small"
                          sx={{
                            background: 'rgba(46, 125, 50, 0.1)',
                            color: 'success.main',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  {/* Show detected columns */}
                  {selectedUpload.file_content[0] && (
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Detected Columns:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {Object.keys(selectedUpload.file_content[0]).map((col) => (
                          <Chip
                            key={col}
                            label={col}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                        Required columns: Dataset Name, Description, Disease Type, Sample Size, Data Accessibility
                      </Typography>
                    </Alert>
                  )}
                  <TableContainer
                    component={Paper}
                    elevation={2}
                    sx={{
                      maxHeight: 500,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '& .MuiTable-root': {
                        minWidth: 650,
                      },
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow
                          sx={{
                            background: 'linear-gradient(90deg, rgba(114, 7, 171, 0.1) 0%, rgba(220, 0, 78, 0.1) 100%)',
                            '& .MuiTableCell-head': {
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: 'text.primary',
                              borderBottom: '2px solid',
                              borderColor: 'divider',
                              position: 'sticky',
                              top: 0,
                              zIndex: 1,
                            },
                          }}
                        >
                          {selectedUpload.file_content[0] &&
                            Object.keys(selectedUpload.file_content[0]).map((key) => (
                              <TableCell key={key} sx={{ textTransform: 'capitalize' }}>
                                {key.replace(/_/g, ' ')}
                              </TableCell>
                            ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedUpload.file_content.slice(0, 20).map((row: any, idx: number) => (
                          <TableRow
                            key={idx}
                            sx={{
                              '&:hover': {
                                background: 'rgba(114, 7, 171, 0.03)',
                              },
                              '&:nth-of-type(even)': {
                                background: 'rgba(0,0,0,0.02)',
                              },
                            }}
                          >
                            {Object.values(row).map((value: any, cellIdx: number) => (
                              <TableCell
                                key={cellIdx}
                                sx={{
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  '&:hover': {
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                  },
                                }}
                                title={String(value)}
                              >
                                {String(value) || <em style={{ color: '#999' }}>N/A</em>}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {selectedUpload.file_content.length > 20 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Chip
                        label={`Showing first 20 of ${selectedUpload.file_content.length} rows`}
                        size="small"
                        sx={{
                          background: 'rgba(114, 7, 171, 0.1)',
                          color: 'primary.main',
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : selectedUpload.file_content ? (
                <Box sx={{ mt: 3 }}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    File content is available but in an unexpected format. Please check the backend data structure.
                  </Alert>
                  <Box sx={{ mt: 2, p: 2, background: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {JSON.stringify(selectedUpload.file_content, null, 2).substring(0, 500)}...
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mt: 3 }}>
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    No file content available for preview. The file may not have been processed correctly.
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={() => setDetailDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Close
          </Button>
          {selectedUpload?.status === 'pending' && (
            <>
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleReview(selectedUpload.id, 'approve');
                }}
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Approve
              </Button>
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleReview(selectedUpload.id, 'reject');
                }}
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: reviewAction === 'approve'
              ? 'linear-gradient(90deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)'
              : 'linear-gradient(90deg, rgba(211, 47, 47, 0.1) 0%, rgba(244, 67, 54, 0.1) 100%)',
            fontWeight: 700,
            fontSize: '1.25rem',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: reviewAction === 'approve' ? 'success.main' : 'error.main',
          }}
        >
          {reviewAction === 'approve' ? 'Approve' : 'Reject'} Upload
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review Notes (Optional)"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Add any notes about this review..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setReviewDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {processing ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default ManagementPage;

