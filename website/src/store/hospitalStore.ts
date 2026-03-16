import { create } from 'zustand';
import { 
  Hospital, 
  CreateHospitalRequest, 
  UpdateHospitalRequest, 
  HospitalFilter, 
  HospitalListResponse, 
  HospitalStats,
  HospitalType
} from '../models';
import { hospitalService } from '../services';

interface HospitalState {
  // State
  hospitals: Hospital[];
  currentHospital: Hospital | null;
  stats: HospitalStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  
  // Filters
  filters: HospitalFilter;
  
  // Options
  cities: string[];
  states: string[];
  types: string[];
  
  // Actions
  fetchHospitals: (filter?: HospitalFilter, page?: number) => Promise<void>;
  fetchHospitalById: (id: string) => Promise<void>;
  createHospital: (hospitalData: CreateHospitalRequest) => Promise<Hospital | null>;
  updateHospital: (id: string, updateData: UpdateHospitalRequest) => Promise<Hospital | null>;
  deleteHospital: (id: string) => Promise<boolean>;
  searchHospitals: (query: string, filter?: HospitalFilter) => Promise<void>;
  fetchHospitalStats: () => Promise<void>;
  fetchHospitalsByCity: (city: string) => Promise<void>;
  fetchHospitalsByState: (state: string) => Promise<void>;
  fetchHospitalsByType: (type: HospitalType) => Promise<void>;
  fetchAvailableCities: () => Promise<void>;
  fetchAvailableStates: () => Promise<void>;
  fetchHospitalTypes: () => Promise<void>;
  verifyHospital: (id: string) => Promise<void>;
  unverifyHospital: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentHospital: () => void;
  setFilters: (filters: HospitalFilter) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  refreshHospitals: () => Promise<void>;
}

const defaultFilters: HospitalFilter = {};

export const useHospitalStore = create<HospitalState>((set, get) => ({
  // Initial state
  hospitals: [],
  currentHospital: null,
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  total: 0,
  limit: 10,
  filters: defaultFilters,
  cities: [],
  states: [],
  types: [],

  // Fetch hospitals
  fetchHospitals: async (filter?: HospitalFilter, page: number = 1) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await hospitalService.getHospitals({ ...filter, page, limit: get().limit });
      
      if (response.success && response.data) {
        const { hospitals, total, totalPages, page: currentPage } = response.data;
        
        set({
          hospitals,
          total,
          totalPages,
          currentPage,
          isLoading: false,
          filters: filter || defaultFilters,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch hospitals',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch hospitals',
        isLoading: false,
      });
    }
  },

  // Fetch hospital by ID
  fetchHospitalById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await hospitalService.getHospitalById(id);
      
      if (response.success && response.data) {
        set({
          currentHospital: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch hospital',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch hospital',
        isLoading: false,
      });
    }
  },

  // Create hospital
  createHospital: async (hospitalData: CreateHospitalRequest) => {
    set({ isCreating: true, error: null });
    
    try {
      const response = await hospitalService.createHospital(hospitalData);
      
      if (response.success && response.data) {
        const newHospital = response.data;
        
        set(state => ({
          hospitals: [newHospital, ...state.hospitals],
          total: state.total + 1,
          isCreating: false,
        }));
        
        return newHospital;
      } else {
        set({
          error: response.error || 'Failed to create hospital',
          isCreating: false,
        });
        return null;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to create hospital',
        isCreating: false,
      });
      return null;
    }
  },

  // Update hospital
  updateHospital: async (id: string, updateData: UpdateHospitalRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await hospitalService.updateHospital(id, updateData);
      
      if (response.success && response.data) {
        const updatedHospital = response.data;
        
        set(state => ({
          hospitals: state.hospitals.map(hospital => 
            hospital.id === id ? updatedHospital : hospital
          ),
          currentHospital: state.currentHospital?.id === id ? updatedHospital : state.currentHospital,
          isUpdating: false,
        }));
        
        return updatedHospital;
      } else {
        set({
          error: response.error || 'Failed to update hospital',
          isUpdating: false,
        });
        return null;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to update hospital',
        isUpdating: false,
      });
      return null;
    }
  },

  // Delete hospital
  deleteHospital: async (id: string) => {
    set({ isDeleting: true, error: null });
    
    try {
      const response = await hospitalService.deleteHospital(id);
      
      if (response.success) {
        set(state => ({
          hospitals: state.hospitals.filter(hospital => hospital.id !== id),
          total: state.total - 1,
          currentHospital: state.currentHospital?.id === id ? null : state.currentHospital,
          isDeleting: false,
        }));
        
        return true;
      } else {
        set({
          error: response.error || 'Failed to delete hospital',
          isDeleting: false,
        });
        return false;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to delete hospital',
        isDeleting: false,
      });
      return false;
    }
  },

  // Search hospitals
  searchHospitals: async (query: string, filter?: HospitalFilter) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await hospitalService.searchHospitals(query, filter);
      
      if (response.success && response.data) {
        const { hospitals, total, totalPages, page: currentPage } = response.data;
        
        set({
          hospitals,
          total,
          totalPages,
          currentPage,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to search hospitals',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to search hospitals',
        isLoading: false,
      });
    }
  },

  // Fetch hospital statistics
  fetchHospitalStats: async () => {
    try {
      const response = await hospitalService.getHospitalStats();
      
      if (response.success && response.data) {
        set({ stats: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch hospital stats:', error);
    }
  },

  // Fetch hospitals by city
  fetchHospitalsByCity: async (city: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await hospitalService.getHospitalsByCity(city);
      
      if (response.success && response.data) {
        set({
          hospitals: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch hospitals',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch hospitals',
        isLoading: false,
      });
    }
  },

  // Fetch hospitals by state
  fetchHospitalsByState: async (state: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await hospitalService.getHospitalsByState(state);
      
      if (response.success && response.data) {
        set({
          hospitals: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch hospitals',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch hospitals',
        isLoading: false,
      });
    }
  },

  // Fetch hospitals by type
  fetchHospitalsByType: async (type: HospitalType) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await hospitalService.getHospitalsByType(type);
      
      if (response.success && response.data) {
        set({
          hospitals: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch hospitals',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch hospitals',
        isLoading: false,
      });
    }
  },

  // Fetch available cities
  fetchAvailableCities: async () => {
    try {
      const response = await hospitalService.getAvailableCities();
      
      if (response.success && response.data) {
        set({ cities: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  },

  // Fetch available states
  fetchAvailableStates: async () => {
    try {
      const response = await hospitalService.getAvailableStates();
      
      if (response.success && response.data) {
        set({ states: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  },

  // Fetch hospital types
  fetchHospitalTypes: async () => {
    try {
      const response = await hospitalService.getHospitalTypes();
      
      if (response.success && response.data) {
        set({ types: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch hospital types:', error);
    }
  },

  // Verify hospital
  verifyHospital: async (id: string) => {
    const response = await hospitalService.verifyHospital(id);
    
    if (response.success && response.data) {
      const verifiedHospital = response.data;
      
      set(state => ({
        hospitals: state.hospitals.map(hospital => 
          hospital.id === id ? verifiedHospital : hospital
        ),
        currentHospital: state.currentHospital?.id === id ? verifiedHospital : state.currentHospital,
      }));
    }
  },

  // Unverify hospital
  unverifyHospital: async (id: string) => {
    const response = await hospitalService.unverifyHospital(id);
    
    if (response.success && response.data) {
      const unverifiedHospital = response.data;
      
      set(state => ({
        hospitals: state.hospitals.map(hospital => 
          hospital.id === id ? unverifiedHospital : hospital
        ),
        currentHospital: state.currentHospital?.id === id ? unverifiedHospital : state.currentHospital,
      }));
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear current hospital
  clearCurrentHospital: () => {
    set({ currentHospital: null });
  },

  // Set filters
  setFilters: (filters: HospitalFilter) => {
    set({ filters });
  },

  // Reset filters
  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  // Set current page
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  // Refresh hospitals
  refreshHospitals: async () => {
    const { filters, currentPage } = get();
    await get().fetchHospitals(filters, currentPage);
  },
}));

// Hospital store actions for non-react usage
export const hospitalActions = {
  fetchHospitals: (filter?: HospitalFilter, page?: number) => useHospitalStore.getState().fetchHospitals(filter, page),
  fetchHospitalById: (id: string) => useHospitalStore.getState().fetchHospitalById(id),
  createHospital: (hospitalData: CreateHospitalRequest) => useHospitalStore.getState().createHospital(hospitalData),
  updateHospital: (id: string, updateData: UpdateHospitalRequest) => useHospitalStore.getState().updateHospital(id, updateData),
  deleteHospital: (id: string) => useHospitalStore.getState().deleteHospital(id),
  searchHospitals: (query: string, filter?: HospitalFilter) => useHospitalStore.getState().searchHospitals(query, filter),
  fetchHospitalStats: () => useHospitalStore.getState().fetchHospitalStats(),
  fetchHospitalsByCity: (city: string) => useHospitalStore.getState().fetchHospitalsByCity(city),
  fetchHospitalsByState: (state: string) => useHospitalStore.getState().fetchHospitalsByState(state),
  fetchHospitalsByType: (type: HospitalType) => useHospitalStore.getState().fetchHospitalsByType(type),
  fetchAvailableCities: () => useHospitalStore.getState().fetchAvailableCities(),
  fetchAvailableStates: () => useHospitalStore.getState().fetchAvailableStates(),
  fetchHospitalTypes: () => useHospitalStore.getState().fetchHospitalTypes(),
  verifyHospital: (id: string) => useHospitalStore.getState().verifyHospital(id),
  unverifyHospital: (id: string) => useHospitalStore.getState().unverifyHospital(id),
  clearError: () => useHospitalStore.getState().clearError(),
  clearCurrentHospital: () => useHospitalStore.getState().clearCurrentHospital(),
  setFilters: (filters: HospitalFilter) => useHospitalStore.getState().setFilters(filters),
  resetFilters: () => useHospitalStore.getState().resetFilters(),
  setCurrentPage: (page: number) => useHospitalStore.getState().setCurrentPage(page),
  refreshHospitals: () => useHospitalStore.getState().refreshHospitals(),
};

// Hospital selectors
export const hospitalSelectors = {
  getHospitals: () => useHospitalStore.getState().hospitals,
  getCurrentHospital: () => useHospitalStore.getState().currentHospital,
  getStats: () => useHospitalStore.getState().stats,
  isLoading: () => useHospitalStore.getState().isLoading,
  isCreating: () => useHospitalStore.getState().isCreating,
  isUpdating: () => useHospitalStore.getState().isUpdating,
  isDeleting: () => useHospitalStore.getState().isDeleting,
  getError: () => useHospitalStore.getState().error,
  getCurrentPage: () => useHospitalStore.getState().currentPage,
  getTotalPages: () => useHospitalStore.getState().totalPages,
  getTotal: () => useHospitalStore.getState().total,
  getLimit: () => useHospitalStore.getState().limit,
  getFilters: () => useHospitalStore.getState().filters,
  getCities: () => useHospitalStore.getState().cities,
  getStates: () => useHospitalStore.getState().states,
  getTypes: () => useHospitalStore.getState().types,
  getHospitalById: (id: string) => useHospitalStore.getState().hospitals.find(hospital => hospital.id === id),
  getHospitalsByType: (type: HospitalType) => useHospitalStore.getState().hospitals.filter(hospital => hospital.type === type),
  getVerifiedHospitals: () => useHospitalStore.getState().hospitals.filter(hospital => hospital.isVerified),
  getUnverifiedHospitals: () => useHospitalStore.getState().hospitals.filter(hospital => !hospital.isVerified),
  getHospitalsByCity: (city: string) => useHospitalStore.getState().hospitals.filter(hospital => hospital.city === city),
  getHospitalsByState: (state: string) => useHospitalStore.getState().hospitals.filter(hospital => hospital.state === state),
};
