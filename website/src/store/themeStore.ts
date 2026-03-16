import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  // State
  theme: Theme;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
  isLoading: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSystemTheme: (systemTheme: 'light' | 'dark') => void;
  updateEffectiveTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      systemTheme: 'light',
      effectiveTheme: 'light',
      isLoading: true,

      // Set theme
      setTheme: (theme: Theme) => {
        set({ theme });
        get().updateEffectiveTheme();
      },

      // Toggle theme
      toggleTheme: () => {
        const { effectiveTheme } = get();
        const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        get().updateEffectiveTheme();
      },

      // Set system theme
      setSystemTheme: (systemTheme: 'light' | 'dark') => {
        set({ systemTheme });
        get().updateEffectiveTheme();
      },

      // Update effective theme based on current theme and system theme
      updateEffectiveTheme: () => {
        const { theme, systemTheme } = get();
        const effectiveTheme = theme === 'system' ? systemTheme : theme;
        
        set({ effectiveTheme, isLoading: false });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          
          if (effectiveTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
          
          // Store theme preference
          localStorage.setItem('theme', theme);
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);

// Theme store actions for non-react usage
export const themeActions = {
  setTheme: (theme: Theme) => useThemeStore.getState().setTheme(theme),
  toggleTheme: () => useThemeStore.getState().toggleTheme(),
  setSystemTheme: (systemTheme: 'light' | 'dark') => useThemeStore.getState().setSystemTheme(systemTheme),
  updateEffectiveTheme: () => useThemeStore.getState().updateEffectiveTheme(),
};

// Theme selectors
export const themeSelectors = {
  getTheme: () => useThemeStore.getState().theme,
  getSystemTheme: () => useThemeStore.getState().systemTheme,
  getEffectiveTheme: () => useThemeStore.getState().effectiveTheme,
  isLoading: () => useThemeStore.getState().isLoading,
  isDark: () => useThemeStore.getState().effectiveTheme === 'dark',
  isLight: () => useThemeStore.getState().effectiveTheme === 'light',
  isSystem: () => useThemeStore.getState().theme === 'system',
};

// Initialize theme system
export const initializeTheme = () => {
  if (typeof window !== 'undefined') {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemTheme = mediaQuery.matches ? 'dark' : 'light';
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      themeActions.setSystemTheme(newSystemTheme);
    });
    
    // Set initial system theme
    themeActions.setSystemTheme(systemTheme);
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      themeActions.setTheme(savedTheme);
    } else {
      themeActions.updateEffectiveTheme();
    }
  }
};

// Theme utilities
export const themeUtils = {
  // Get theme-aware class name
  getThemeClass: (lightClass: string, darkClass: string) => {
    const { effectiveTheme } = useThemeStore.getState();
    return effectiveTheme === 'dark' ? darkClass : lightClass;
  },
  
  // Get theme-aware color
  getThemeColor: (lightColor: string, darkColor: string) => {
    const { effectiveTheme } = useThemeStore.getState();
    return effectiveTheme === 'dark' ? darkColor : lightColor;
  },
  
  // Check if current theme is dark
  isDarkMode: () => {
    return useThemeStore.getState().effectiveTheme === 'dark';
  },
  
  // Check if current theme is light
  isLightMode: () => {
    return useThemeStore.getState().effectiveTheme === 'light';
  },
  
  // Get CSS variable value
  getCSSVariable: (variableName: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(variableName);
    }
    return '';
  },
  
  // Set CSS variable value
  setCSSVariable: (variableName: string, value: string) => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty(variableName, value);
    }
  },
};

// Theme constants
export const themeConstants = {
  // CSS custom properties
  CSS_VARS: {
    PRIMARY: '--color-primary',
    SECONDARY: '--color-secondary',
    BACKGROUND: '--color-background',
    SURFACE: '--color-surface',
    TEXT: '--color-text',
    TEXT_MUTED: '--color-text-muted',
    BORDER: '--color-border',
    SUCCESS: '--color-success',
    WARNING: '--color-warning',
    ERROR: '--color-error',
  },
  
  // Theme colors
  COLORS: {
    LIGHT: {
      PRIMARY: '#3B82F6',
      SECONDARY: '#6B7280',
      BACKGROUND: '#FFFFFF',
      SURFACE: '#F9FAFB',
      TEXT: '#111827',
      TEXT_MUTED: '#6B7280',
      BORDER: '#E5E7EB',
      SUCCESS: '#10B981',
      WARNING: '#F59E0B',
      ERROR: '#EF4444',
    },
    DARK: {
      PRIMARY: '#60A5FA',
      SECONDARY: '#9CA3AF',
      BACKGROUND: '#111827',
      SURFACE: '#1F2937',
      TEXT: '#F9FAFB',
      TEXT_MUTED: '#9CA3AF',
      BORDER: '#374151',
      SUCCESS: '#34D399',
      WARNING: '#FBBF24',
      ERROR: '#F87171',
    },
  },
  
  // Breakpoints
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
  
  // Transitions
  TRANSITIONS: {
    FAST: '150ms ease-in-out',
    NORMAL: '300ms ease-in-out',
    SLOW: '500ms ease-in-out',
  },
};

// Apply theme CSS variables
export const applyThemeCSSVariables = () => {
  const { effectiveTheme } = useThemeStore.getState();
  const colors = themeConstants.COLORS[effectiveTheme.toUpperCase()];
  
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = themeConstants.CSS_VARS[key as keyof typeof themeConstants.CSS_VARS];
    if (cssVar) {
      themeUtils.setCSSVariable(cssVar, value);
    }
  });
};
