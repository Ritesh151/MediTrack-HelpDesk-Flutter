import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ErrorResponse } from '../models';

export class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;
  private baseURL: string = 'http://localhost:5000';

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  private handleUnauthorized(): void {
    this.clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private formatError(error: AxiosError): Error {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // Handle specific HTTP status codes with better messages
    switch (status) {
      case 404:
        return new Error('Resource not found (404): The requested endpoint does not exist');
      case 401:
        return new Error('Unauthorized (401): Please login to access this resource');
      case 403:
        return new Error('Forbidden (403): You do not have permission to access this resource');
      case 500:
        return new Error('Server Error (500): Internal server error occurred');
      case 409:
        return new Error('Conflict (409): Resource conflict detected');
      case 422:
        return new Error('Validation Error (422): Invalid input data');
      case 429:
        return new Error('Too Many Requests (429): Rate limit exceeded');
      default:
        break;
    }

    // Handle structured error responses from backend
    if (data && typeof data === 'object') {
      if (data.message) {
        return new Error(`[${status}] ${data.message}`);
      }
      if (data.error) {
        return new Error(`[${status}] ${data.error}`);
      }
      if (data.errors && Array.isArray(data.errors)) {
        return new Error(`[${status}] ${data.errors.join(', ')}`);
      }
    }

    // Handle string error responses
    if (typeof data === 'string' && data.trim()) {
      return new Error(`[${status}] ${data.trim()}`);
    }

    // Fallback to Axios error message
    return new Error(error.message || 'Network error occurred');
  }

  // HTTP Methods
  public async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async patch<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // File upload
  public async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.axiosInstance.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // Download file
  public async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.axiosInstance.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  // Set authentication token
  public setAuthToken(token: string): void {
    this.setToken(token);
  }

  // Clear authentication token
  public clearAuthToken(): void {
    this.clearToken();
  }

  // Get current token
  public getAuthToken(): string | null {
    return this.getToken();
  }

  // Set base URL
  public setBaseURL(url: string): void {
    this.baseURL = url;
    this.axiosInstance.defaults.baseURL = url;
  }

  // Get axios instance for custom requests
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
