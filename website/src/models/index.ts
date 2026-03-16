// Export all models
export * from './user';
export * from './ticket';
export * from './hospital';
export * from './message';

// Common utility types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface DateRange {
  from: string;
  to: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  coordinates?: Coordinates;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
}

export interface FileUpload {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  version: string;
  features: {
    chat: boolean;
    fileUpload: boolean;
    notifications: boolean;
  };
  limits: {
    maxFileSize: number;
    maxMessagesPerChat: number;
    maxTicketsPerUser: number;
  };
}
