/**
 * Authentication service for admin login
 */

const AUTH_TOKEN_KEY = 'adrd_admin_auth';
const AUTH_USERNAME_KEY = 'adrd_admin_username';

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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication info in localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, 'authenticated');
        localStorage.setItem(AUTH_USERNAME_KEY, data.username || credentials.username);
        return { success: true, message: data.message, username: data.username };
      } else {
        return { success: false, message: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/logout`, {
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

