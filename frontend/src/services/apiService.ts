import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface Dataset {
  id: number;
  name: string;
  description?: string;
  disease_type: string;
  sample_size?: number;
  data_accessibility: string;
  wgs_available?: string;
  imaging_types?: string;
  modalities?: string;
  created_at?: string;
}

export interface Publication {
  id: number;
  title: string;
  authors?: string;
  journal?: string;
  year?: number;
  pmid?: string;
  doi?: string;
  dataset_name?: string;
  created_at?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  current_page: number;
}

export interface Stats {
  total_datasets: number;
  total_publications: number;
  disease_distribution: Array<{
    disease_type: string;
    count: number;
  }>;
}

export interface FilterOptions {
  disease_types: string[];
  modalities: string[];
}

class ApiService {
  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  }

  // Dataset endpoints
  async getDatasets(params?: {
    disease_type?: string;
    modality?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ datasets: Dataset[] } & Omit<PaginatedResponse<Dataset>, 'items'>> {
    const response = await apiClient.get('/datasets', { params });
    return response.data;
  }

  async getDataset(id: number): Promise<Dataset> {
    const response = await apiClient.get(`/datasets/${id}`);
    return response.data;
  }

  // Publication endpoints
  async getPublications(params?: {
    dataset_name?: string;
    title_search?: string;
    year?: number;
    page?: number;
    per_page?: number;
  }): Promise<{ publications: Publication[] } & Omit<PaginatedResponse<Publication>, 'items'>> {
    const response = await apiClient.get('/publications', { params });
    return response.data;
  }

  // Statistics endpoint
  async getStats(): Promise<Stats> {
    const response = await apiClient.get('/stats');
    return response.data;
  }

  // Filter options endpoint
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await apiClient.get('/filters');
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
