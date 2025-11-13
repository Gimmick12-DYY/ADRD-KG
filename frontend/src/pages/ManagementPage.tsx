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
  Visibility,
  Logout,
  Refresh,
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
  const [selectedUpload, setSelectedUpload] = useState<UploadDetail | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const username = authService.getUsername();

  useEffect(() => {
    fetchUploads();
  }, [tabValue]);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = tabValue === 0 ? 'pending' : tabValue === 1 ? 'approved' : 'rejected';
      const data = await apiService.getPendingUploads(status);
      setUploads(data.uploads || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch uploads');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (uploadId: number) => {
    try {
      const detail = await apiService.getPendingUploadDetail(uploadId);
      setSelectedUpload(detail);
      setDetailDialogOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch upload details');
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
      if (reviewAction === 'approve') {
        await apiService.approveUpload(selectedUpload.id, reviewNotes, username || 'admin');
      } else {
        await apiService.rejectUpload(selectedUpload.id, reviewNotes, username || 'admin');
      }
      setReviewDialogOpen(false);
      setDetailDialogOpen(false);
      setReviewNotes('');
      fetchUploads();
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
      <Container maxWidth="lg">
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
              <Tab label={`Pending (${uploads.length})`} />
              <Tab label="Approved" />
              <Tab label="Rejected" />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, p: 2, pt: 3 }}>
            <Button
              startIcon={<Refresh />}
              onClick={fetchUploads}
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
                            sx={{
                              '&:hover': {
                                background: 'rgba(114, 7, 171, 0.1)',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <Visibility />
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

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
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
            background: 'linear-gradient(90deg, rgba(114, 7, 171, 0.08) 0%, rgba(220, 0, 78, 0.08) 100%)',
            fontWeight: 700,
            fontSize: '1.25rem',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          Upload Details: {selectedUpload?.file_name}
        </DialogTitle>
        <DialogContent>
          {selectedUpload && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>File Type:</strong> {selectedUpload.file_type}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Uploaded By:</strong> {selectedUpload.uploaded_by || 'Anonymous'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Status:</strong>{' '}
                <Chip
                  label={selectedUpload.status}
                  color={getStatusColor(selectedUpload.status) as any}
                  size="small"
                />
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Created:</strong> {new Date(selectedUpload.created_at).toLocaleString()}
              </Typography>
              {selectedUpload.review_notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Review Notes:</Typography>
                  <Typography variant="body2">{selectedUpload.review_notes}</Typography>
                </Box>
              )}
              {selectedUpload.file_content && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    File Content Preview ({selectedUpload.file_content.length} rows):
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {selectedUpload.file_content[0] &&
                            Object.keys(selectedUpload.file_content[0]).map((key) => (
                              <TableCell key={key}>{key}</TableCell>
                            ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedUpload.file_content.slice(0, 10).map((row: any, idx: number) => (
                          <TableRow key={idx}>
                            {Object.values(row).map((value: any, cellIdx: number) => (
                              <TableCell key={cellIdx}>{String(value)}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {selectedUpload.file_content.length > 10 && (
                    <Typography variant="caption" color="text.secondary">
                      Showing first 10 rows of {selectedUpload.file_content.length} total rows
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {selectedUpload?.status === 'pending' && (
            <>
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleReview(selectedUpload.id, 'approve');
                }}
                color="success"
                startIcon={<CheckCircle />}
              >
                Approve
              </Button>
              <Button
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleReview(selectedUpload.id, 'reject');
                }}
                color="error"
                startIcon={<Cancel />}
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

