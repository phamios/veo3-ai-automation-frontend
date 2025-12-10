// API Client - Base HTTP client for all API calls

// In dev mode, Vite proxy handles /api -> backend
// In production, use VITE_API_URL directly
const API_BASE = import.meta.env.PROD && import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// Token storage in memory (secure - not localStorage)
let accessToken: string | null = null;

// Session invalidation callback
let onSessionInvalid: (() => void) | null = null;

export const apiClient = {
  setAccessToken: (token: string | null) => {
    accessToken = token;
  },

  getAccessToken: () => accessToken,

  setSessionInvalidCallback: (callback: () => void) => {
    onSessionInvalid = callback;
  },

  clearAuth: () => {
    accessToken = null;
  },
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if available and not skipped
  if (!skipAuth && accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // For cookies
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Handle 401 Unauthorized - session invalid
    if (response.status === 401 && !skipAuth) {
      apiClient.clearAuth();
      if (onSessionInvalid) {
        onSessionInvalid();
      }
      throw new ApiError('SESSION_INVALID', 'Phiên đăng nhập hết hạn', 401);
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new ApiError('FORBIDDEN', 'Bạn không có quyền truy cập', 403);
    }

    // Parse response
    const result: ApiResponse<T> = await response.json();

    // Handle error responses
    if (!response.ok || !result.success) {
      throw new ApiError(
        result.error?.code || 'API_ERROR',
        result.error?.message || 'Có lỗi xảy ra',
        response.status
      );
    }

    return result.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or parsing error
    throw new ApiError('NETWORK_ERROR', 'Không thể kết nối đến server', 0);
  }
}

// Custom error class
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// Helper functions
export const get = <T>(endpoint: string, skipAuth = false) =>
  apiRequest<T>(endpoint, { method: 'GET', skipAuth });

export const post = <T>(endpoint: string, body?: unknown, skipAuth = false) =>
  apiRequest<T>(endpoint, { method: 'POST', body, skipAuth });

export const put = <T>(endpoint: string, body?: unknown) =>
  apiRequest<T>(endpoint, { method: 'PUT', body });

export const del = <T>(endpoint: string) =>
  apiRequest<T>(endpoint, { method: 'DELETE' });
