/**
 * Authentication service for admin login
 */

const AUTH_TOKEN_KEY = 'adrd_admin_auth';
const AUTH_USERNAME_KEY = 'adrd_admin_username';

// API Base URL configuration (same as api.ts)
const getApiBaseUrl = () => {
  // Check for custom API URL (highest priority - for custom deployments)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if we're in development mode (local development)
  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api';
  }
  
  // For production deployments (Vercel, etc.), use relative URL
  // Vercel routes /api/* to the backend automatically
  return '/api';
};

export interface LoginCredentials {
  username: string;
  password: string;
}

export const authService = {
  /**
   * Login with username and password
   */
  login: async (credentials: LoginCredentials): Promise<{ success: boolean; message: string; username?: string }> => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, it might be an error
        const statusText = response.status ? ` (${response.status})` : '';
        return { 
          success: false, 
          message: `Server error${statusText}. Please check if the backend is running.` 
        };
      }

      if (response.ok && data.success) {
        // Store authentication info in localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, 'authenticated');
        localStorage.setItem(AUTH_USERNAME_KEY, data.username || credentials.username);
        return { success: true, message: data.message, username: data.username };
      } else {
        return { success: false, message: data.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Network error. Please check if the backend server is running and accessible.' 
      };
    }
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USERNAME_KEY);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return localStorage.getItem(AUTH_TOKEN_KEY) === 'authenticated';
  },

  /**
   * Get current username
   */
  getUsername: (): string | null => {
    return localStorage.getItem(AUTH_USERNAME_KEY);
  },
};

