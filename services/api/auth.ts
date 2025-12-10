// Auth API Service
import { apiClient, post, get, ApiError } from './client';
import { User, UserRole } from '../../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginResponse {
  access_token: string;  // Backend uses snake_case
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

export interface AuthUser extends User {
  sessionId?: string;
}

// Auth token storage key for persistence check
const TOKEN_STORAGE_KEY = 'veo3_has_token';

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    return post('/auth/register', data, true);
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<AuthUser> => {
    const response = await post<LoginResponse>('/auth/login', data, true);

    // Store access token in memory
    apiClient.setAccessToken(response.access_token);

    // Mark that we have a token (for page refresh check)
    localStorage.setItem(TOKEN_STORAGE_KEY, 'true');

    // Return user data
    return {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      role: response.user.role as UserRole,
      avatar: response.user.avatar || 'https://picsum.photos/100/100',
    };
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await post('/auth/logout', {});
    } catch (error) {
      // Ignore errors on logout
    } finally {
      apiClient.clearAuth();
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },

  /**
   * Get current user info
   */
  getMe: async (): Promise<AuthUser | null> => {
    try {
      const user = await get<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar?: string;
      }>('/auth/me');

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        avatar: user.avatar || 'https://picsum.photos/100/100',
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Check session validity
   */
  checkSession: async (): Promise<boolean> => {
    try {
      await get('/auth/session/status');
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      // Network error - assume session is still valid
      return true;
    }
  },

  /**
   * Check if user has stored token (for page refresh)
   */
  hasStoredToken: (): boolean => {
    return localStorage.getItem(TOKEN_STORAGE_KEY) === 'true';
  },

  /**
   * Clear stored token marker
   */
  clearStoredToken: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};
