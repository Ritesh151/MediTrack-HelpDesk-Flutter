import { apiService } from './apiService';
import { 
  Hospital, 
  CreateHospitalRequest, 
  UpdateHospitalRequest, 
  HospitalFilter, 
  HospitalListResponse, 
  HospitalStats,
  ApiResponse 
} from '../models';

export class HospitalService {
  private static instance: HospitalService;

  private constructor() {}

  public static getInstance(): HospitalService {
    if (!HospitalService.instance) {
      HospitalService.instance = new HospitalService();
    }
    return HospitalService.instance;
  }

  // Get all hospitals with filtering and pagination
  public async getHospitals(filter?: HospitalFilter): Promise<ApiResponse<HospitalListResponse>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/hospitals?${queryString}` : '/api/hospitals';
    
    return apiService.get<HospitalListResponse>(url);
  }

  // Get hospital by ID
  public async getHospitalById(id: string): Promise<ApiResponse<Hospital>> {
    return apiService.get<Hospital>(`/api/hospitals/${id}`);
  }

  // Create new hospital
  public async createHospital(hospitalData: CreateHospitalRequest): Promise<ApiResponse<Hospital>> {
    return apiService.post<Hospital>('/api/hospitals', hospitalData);
  }

  // Update hospital
  public async updateHospital(id: string, updateData: UpdateHospitalRequest): Promise<ApiResponse<Hospital>> {
    return apiService.put<Hospital>(`/api/hospitals/${id}`, updateData);
  }

  // Delete hospital
  public async deleteHospital(id: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/api/hospitals/${id}`);
  }

  // Search hospitals
  public async searchHospitals(query: string, filter?: HospitalFilter): Promise<ApiResponse<HospitalListResponse>> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'search') {
          params.append(key, String(value));
        }
      });
    }

    return apiService.get<HospitalListResponse>(`/api/hospitals/search?${params.toString()}`);
  }

  // Get hospital statistics
  public async getHospitalStats(): Promise<ApiResponse<HospitalStats>> {
    return apiService.get<HospitalStats>('/api/hospitals/stats');
  }

  // Get hospitals by city
  public async getHospitalsByCity(city: string): Promise<ApiResponse<Hospital[]>> {
    return apiService.get<Hospital[]>(`/api/hospitals/city/${city}`);
  }

  // Get hospitals by state
  public async getHospitalsByState(state: string): Promise<ApiResponse<Hospital[]>> {
    return apiService.get<Hospital[]>(`/api/hospitals/state/${state}`);
  }

  // Get hospitals by type
  public async getHospitalsByType(type: string): Promise<ApiResponse<Hospital[]>> {
    return apiService.get<Hospital[]>(`/api/hospitals/type/${type}`);
  }

  // Get available cities
  public async getAvailableCities(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>('/api/hospitals/cities');
  }

  // Get available states
  public async getAvailableStates(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>('/api/hospitals/states');
  }

  // Get hospital types
  public async getHospitalTypes(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>('/api/hospitals/types');
  }

  // Verify hospital
  public async verifyHospital(id: string): Promise<ApiResponse<Hospital>> {
    return apiService.patch<Hospital>(`/api/hospitals/${id}/verify`);
  }

  // Unverify hospital
  public async unverifyHospital(id: string): Promise<ApiResponse<Hospital>> {
    return apiService.patch<Hospital>(`/api/hospitals/${id}/unverify`);
  }

  // Get verified hospitals
  public async getVerifiedHospitals(filter?: HospitalFilter): Promise<ApiResponse<HospitalListResponse>> {
    const verifiedFilter = { ...filter, isVerified: true };
    return this.getHospitals(verifiedFilter);
  }

  // Get unverified hospitals
  public async getUnverifiedHospitals(filter?: HospitalFilter): Promise<ApiResponse<HospitalListResponse>> {
    const unverifiedFilter = { ...filter, isVerified: false };
    return this.getHospitals(unverifiedFilter);
  }

  // Export hospitals
  public async exportHospitals(filter?: HospitalFilter, format: string = 'csv'): Promise<void> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const url = `/api/hospitals/export?${params.toString()}`;
    await apiService.download(url, `hospitals.${format}`);
  }

  // Bulk update hospitals
  public async bulkUpdateHospitals(hospitalIds: string[], updateData: UpdateHospitalRequest): Promise<ApiResponse<Hospital[]>> {
    return apiService.put<Hospital[]>('/api/hospitals/bulk', {
      hospitalIds,
      updateData,
    });
  }

  // Bulk delete hospitals
  public async bulkDeleteHospitals(hospitalIds: string[]): Promise<ApiResponse<any>> {
    return apiService.delete('/api/hospitals/bulk', {
      data: { hospitalIds }
    });
  }

  // Upload hospital image
  public async uploadHospitalImage(hospitalId: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> {
    return apiService.upload(`/api/hospitals/${hospitalId}/image`, file, onProgress);
  }

  // Get hospital image
  public async getHospitalImage(hospitalId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/api/hospitals/${hospitalId}/image`);
  }

  // Delete hospital image
  public async deleteHospitalImage(hospitalId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/api/hospitals/${hospitalId}/image`);
  }

  // Get hospital departments
  public async getHospitalDepartments(hospitalId: string): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`/api/hospitals/${hospitalId}/departments`);
  }

  // Get hospital services
  public async getHospitalServices(hospitalId: string): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`/api/hospitals/${hospitalId}/services`);
  }

  // Add department to hospital
  public async addDepartment(hospitalId: string, department: string): Promise<ApiResponse<Hospital>> {
    return apiService.post<Hospital>(`/api/hospitals/${hospitalId}/departments`, { department });
  }

  // Remove department from hospital
  public async removeDepartment(hospitalId: string, department: string): Promise<ApiResponse<Hospital>> {
    return apiService.delete<Hospital>(`/api/hospitals/${hospitalId}/departments/${department}`);
  }

  // Add service to hospital
  public async addService(hospitalId: string, service: string): Promise<ApiResponse<Hospital>> {
    return apiService.post<Hospital>(`/api/hospitals/${hospitalId}/services`, { service });
  }

  // Remove service from hospital
  public async removeService(hospitalId: string, service: string): Promise<ApiResponse<Hospital>> {
    return apiService.delete<Hospital>(`/api/hospitals/${hospitalId}/services/${service}`);
  }

  // Get hospital ratings
  public async getHospitalRatings(hospitalId: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/api/hospitals/${hospitalId}/ratings`);
  }

  // Add hospital rating
  public async addHospitalRating(hospitalId: string, rating: number, comment?: string): Promise<ApiResponse<any>> {
    return apiService.post(`/api/hospitals/${hospitalId}/ratings`, { rating, comment });
  }

  // Get hospital analytics
  public async getHospitalAnalytics(filter?: HospitalFilter): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/hospitals/analytics?${queryString}` : '/api/hospitals/analytics';
    
    return apiService.get(url);
  }

  // Get nearby hospitals
  public async getNearbyHospitals(latitude: number, longitude: number, radius: number = 10): Promise<ApiResponse<Hospital[]>> {
    return apiService.get<Hospital[]>(`/api/hospitals/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  }

  // Get hospital capacity info
  public async getHospitalCapacity(hospitalId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/api/hospitals/${hospitalId}/capacity`);
  }

  // Update hospital capacity
  public async updateHospitalCapacity(hospitalId: string, capacity: number): Promise<ApiResponse<Hospital>> {
    return apiService.patch<Hospital>(`/api/hospitals/${hospitalId}/capacity`, { capacity });
  }
}

// Export singleton instance
export const hospitalService = HospitalService.getInstance();
