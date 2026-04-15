import { API_CONFIG } from './config';

// API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Request options
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  skipAuth?: boolean;
}

// Token storage
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

// API Client
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
      skipAuth = false,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.baseURL}${endpoint}`;

      const isFormData = body instanceof FormData;
      const requestHeaders: Record<string, string> = {
        ...headers,
      };

      if (!isFormData) {
        requestHeaders['Content-Type'] = 'application/json';
      }

      if (!skipAuth && authToken) {
        requestHeaders.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch {
        return {
          success: false,
          error: response.ok ? '数据格式错误' : '服务器错误',
        };
      }

      if (!response.ok) {
        if (response.status === 401) {
          authToken = null;
        }
        return {
          success: false,
          error: data.error || '请求失败',
          message: data.message,
        };
      }

      return {
        success: data.success !== false,
        data: data.data,
        error: data.error,
        message: data.message,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: '请求超时',
        };
      }

      return {
        success: false,
        error: '网络错误，请稍后重试',
      };
    }
  }

  async get<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);
