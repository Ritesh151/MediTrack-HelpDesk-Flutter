import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models';
import { authService } from '../services';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  getMe: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
  tryAutoLogin: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(credentials);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              error: response.error || 'Login failed',
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error: (error as Error).message || 'Login failed',
            isLoading: false,
          });
        }
      },

      // Register action
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(userData);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              error: response.error || 'Registration failed',
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error: (error as Error).message || 'Registration failed',
            isLoading: false,
          });
        }
      },

      // Logout action
      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // Get current user
      getMe: async () => {
        try {
          const response = await authService.getMe();
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
            });
          } else {
            // If getMe fails, clear auth state
            get().logout();
          }
        } catch (error) {
          // If getMe fails, clear auth state
          get().logout();
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Update user data
      updateUser: (user: User) => {
        set({ user });
      },

      // Try auto login
      tryAutoLogin: async (): Promise<boolean> => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          return true;
        }

        set({ isLoading: true });
        
        try {
          const success = await authService.tryAutoLogin();
          
          if (success) {
            const user = authService.getCurrentUser();
            if (user) {
              set({
                user,
                token: authService.getAuthToken(),
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            }
          }
          
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({
            isLoading: false,
            error: (error as Error).message,
          });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auth store actions for non-react usage
export const authActions = {
  login: (credentials: LoginRequest) => useAuthStore.getState().login(credentials),
  register: (userData: RegisterRequest) => useAuthStore.getState().register(userData),
  logout: () => useAuthStore.getState().logout(),
  getMe: () => useAuthStore.getState().getMe(),
  tryAutoLogin: () => useAuthStore.getState().tryAutoLogin(),
  clearError: () => useAuthStore.getState().clearError(),
  updateUser: (user: User) => useAuthStore.getState().updateUser(user),
};

// Auth selectors
export const authSelectors = {
  getUser: () => useAuthStore.getState().user,
  getToken: () => useAuthStore.getState().token,
  isAuthenticated: () => useAuthStore.getState().isAuthenticated,
  isLoading: () => useAuthStore.getState().isLoading,
  getError: () => useAuthStore.getState().error,
  hasRole: (role: string) => useAuthStore.getState().user?.role === role,
  hasAnyRole: (roles: string[]) => {
    const user = useAuthStore.getState().user;
    return user ? roles.includes(user.role) : false;
  },
  hasPermission: (permission: string) => {
    const user = useAuthStore.getState().user;
    return user?.permissions?.includes(permission) || false;
  },
};
