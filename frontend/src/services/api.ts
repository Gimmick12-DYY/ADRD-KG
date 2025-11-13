import axios from 'axios';

// API Base URL configuration for different deployment environments
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api';
  }
  
  // Check for custom API URL (for GitHub Pages + external backend)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Default to relative URL (for same-origin deployments like Vercel)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Dataset {
  id: number;
  name: string;
  description: string;
  disease_type: string;
  sample_size: number;
  data_accessibility: string;
  wgs_available: string;
  imaging_types: string;
  modalities: string;
  created_at: string;
}

export interface Publication {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: number;
  pmid: string;
  doi: string;
  dataset_name: string;
  created_at: string;
}

export interface AnalyticsOverview {
  overview: {
    total_datasets: number;
    total_publications: number;
    avg_sample_size: number;
    min_sample_size: number;
    max_sample_size: number;
  };
  disease_distribution: Array<{ disease_type: string; count: number }>;
  publication_years: Array<{ year: number; count: number }>;
  data_accessibility: Array<{ accessibility: string; count: number }>;
  wgs_availability: Array<{ availability: string; count: number }>;
}

export interface SearchFilters {
  disease_types: string[];
  modalities: string[];
}

// API Functions
export const apiService = {
  // Health Check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Datasets
  getDatasets: async (params?: {
    disease_type?: string;
    modality?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await api.get('/datasets', { params });
    return response.data;
  },

  getDataset: async (id: number) => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },

  searchDatasets: async (params: {
    q?: string;
    disease_type?: string;
    modality?: string;
    min_sample_size?: number;
    max_sample_size?: number;
    data_accessibility?: string;
    wgs_available?: string;
  }) => {
    const response = await api.get('/datasets/search', { params });
    return response.data;
  },

  getRecentDatasets: async (limit: number = 5) => {
    const response = await api.get('/datasets/recent', { params: { limit } });
    return response.data;
  },

  exportDatasets: async () => {
    const response = await api.get('/datasets/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  getDatasetPublications: async (id: number) => {
    const response = await api.get(`/datasets/${id}/publications`);
    return response.data;
  },

  // Publications
  getPublications: async (params?: {
    dataset_name?: string;
    title_search?: string;
    year?: number;
    page?: number;
    per_page?: number;
  }) => {
    const response = await api.get('/publications', { params });
    return response.data;
  },

  searchPublications: async (params: {
    q?: string;
    dataset_name?: string;
    journal?: string;
    min_year?: number;
    max_year?: number;
    author?: string;
  }) => {
    const response = await api.get('/publications/search', { params });
    return response.data;
  },

  getRecentPublications: async (limit: number = 5) => {
    const response = await api.get('/publications/recent', { params: { limit } });
    return response.data;
  },

  exportPublications: async () => {
    const response = await api.get('/publications/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Analytics
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  // Filters
  getFilters: async (): Promise<SearchFilters> => {
    const response = await api.get('/filters');
    return response.data;
  },

  // Management endpoints
  getPendingUploads: async (status: string = 'pending') => {
    const response = await api.get('/management/pending', { params: { status } });
    return response.data;
  },

  getPendingUploadDetail: async (uploadId: number) => {
    const response = await api.get(`/management/pending/${uploadId}`);
    return response.data;
  },

  approveUpload: async (uploadId: number, reviewNotes: string = '', reviewedBy: string = 'admin') => {
    const response = await api.post(`/management/pending/${uploadId}/approve`, {
      review_notes: reviewNotes,
      reviewed_by: reviewedBy,
    });
    return response.data;
  },

  rejectUpload: async (uploadId: number, reviewNotes: string = '', reviewedBy: string = 'admin') => {
    const response = await api.post(`/management/pending/${uploadId}/reject`, {
      review_notes: reviewNotes,
      reviewed_by: reviewedBy,
    });
    return response.data;
  },

  // File upload
  uploadFile: async (file: File, uploadedBy: string = '') => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as string;
          const fileExtension = file.name.toLowerCase().split('.').pop() || 'csv';
          
          const response = await api.post('/upload', {
            file_name: file.name,
            file_content: fileContent,
            file_type: fileExtension,
            uploaded_by: uploadedBy,
          });
          
          resolve(response.data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      
      // Read file as data URL (base64)
      reader.readAsDataURL(file);
    });
  },
};

export default apiService;
