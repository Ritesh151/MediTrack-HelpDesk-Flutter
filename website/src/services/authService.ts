import { apiService } from './apiService';
import { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../models';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login user
  public async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<any>('/api/auth/login', credentials);
      
      if (response.success && response.data) {
        // Backend returns: {id, name, email, role, hospitalId, permissions, token}
        // We need to transform it to: {user: {...}, token: "..."}
        const backendData = response.data;
        
        const transformedData: AuthResponse = {
          user: {
            id: backendData.id,
            name: backendData.name,
            email: backendData.email,
            role: backendData.role,
            hospitalId: backendData.hospitalId,
            permissions: backendData.permissions || [],
          },
          token: backendData.token
        };
        
        // Store token and user data
        apiService.setAuthToken(transformedData.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', transformedData.token);
          localStorage.setItem('user', JSON.stringify(transformedData.user));
          localStorage.setItem('role', transformedData.user.role);
        }
        
        return {
          success: true,
          data: transformedData,
          message: 'Login successful'
        };
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  }

  // Register new user
  public async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<any>('/api/auth/register', userData);
      
      if (response.success && response.data) {
        // Backend returns: {id, name, email, role, hospitalId, permissions, token}
        // We need to transform it to: {user: {...}, token: "..."}
        const backendData = response.data;
        
        const transformedData: AuthResponse = {
          user: {
            id: backendData.id,
            name: backendData.name,
            email: backendData.email,
            role: backendData.role,
            hospitalId: backendData.hospitalId,
            permissions: backendData.permissions || [],
          },
          token: backendData.token
        };
        
        // Store token and user data
        apiService.setAuthToken(transformedData.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', transformedData.token);
          localStorage.setItem('user', JSON.stringify(transformedData.user));
          localStorage.setItem('role', transformedData.user.role);
        }
        
        return {
          success: true,
          data: transformedData,
          message: 'Registration successful'
        };
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  }

  // Get current user profile
  public async getMe(): Promise<ApiResponse<User>> {
    return apiService.get<User>('/api/auth/me');
  }

  // Logout user
  public logout(): void {
    // Clear token and user data
    apiService.clearAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      return !!(token && user);
    }
    return false;
  }

  // Get stored user data
  public getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Update user profile
  public async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiService.put<User>('/api/auth/profile', userData);
    
    if (response.success && response.data) {
      // Update stored user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    }
    
    return response;
  }

  // Change password
  public async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiService.post('/api/auth/change-password', {
      oldPassword,
      newPassword,
    });
  }

  // Request password reset
  public async requestPasswordReset(email: string): Promise<ApiResponse<any>> {
    return apiService.post('/api/auth/forgot-password', { email });
  }

  // Reset password with token
  public async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiService.post('/api/auth/reset-password', {
      token,
      newPassword,
    });
  }

  // Verify email
  public async verifyEmail(token: string): Promise<ApiResponse<any>> {
    return apiService.post('/api/auth/verify-email', { token });
  }

  // Refresh token
  public async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>('/api/auth/refresh-token');
    
    if (response.success && response.data) {
      // Update stored token
      apiService.setAuthToken(response.data.token);
      if (typeof window !== 'undefined') {
        const user = this.getCurrentUser();
        if (user) {
          const updatedUser = { ...user, ...response.data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    }
    
    return response;
  }

  // Check if user has specific role
  public hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if user has any of the specified roles
  public hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  // Check if user has specific permission
  public hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  // Get user permissions
  public getUserPermissions(): string[] {
    const user = this.getCurrentUser();
    return user?.permissions || [];
  }

  // Auto-login attempt
  public async tryAutoLogin(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response = await this.getMe();
      if (response.success && response.data) {
        // Update stored user data with fresh data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return true;
      } else {
        // Token is invalid, clear it
        this.logout();
        return false;
      }
    } catch (error) {
      // Auto-login failed, clear stored data
      this.logout();
      return false;
    }
  }

  // Store user data manually (for cases where login is handled elsewhere)
  public storeUserData(user: User, token: string): void {
    apiService.setAuthToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
  }

  // Clear all auth data
  public clearAuthData(): void {
    this.logout();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
