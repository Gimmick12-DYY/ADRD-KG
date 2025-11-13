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
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Management Panel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and manage pending file uploads
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ mr: 2, display: 'inline' }}>
            Logged in as: <strong>{username}</strong>
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ ml: 2 }}
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

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label={`Pending (${uploads.length})`} />
              <Tab label="Approved" />
              <Tab label="Rejected" />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              startIcon={<Refresh />}
              onClick={fetchUploads}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : uploads.length === 0 ? (
            <Alert severity="info">No uploads found for this status.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>{upload.file_name}</TableCell>
                      <TableCell>
                        <Chip label={upload.file_type.toUpperCase()} size="small" />
                      </TableCell>
                      <TableCell>{upload.uploaded_by || 'Anonymous'}</TableCell>
                      <TableCell>
                        <Chip
                          label={upload.status}
                          color={getStatusColor(upload.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(upload.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetail(upload.id)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                        {upload.status === 'pending' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleReview(upload.id, 'approve')}
                              color="success"
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleReview(upload.id, 'reject')}
                              color="error"
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
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
      >
        <DialogTitle>
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
      >
        <DialogTitle>
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
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManagementPage;

