// Export all stores
export { useAuthStore, authActions, authSelectors } from './authStore';
export { useTicketStore, ticketActions, ticketSelectors } from './ticketStore';
export { useHospitalStore, hospitalActions, hospitalSelectors } from './hospitalStore';
export { useChatStore, chatActions, chatSelectors } from './chatStore';
export { useThemeStore, themeActions, themeSelectors, initializeTheme, themeUtils, themeConstants, applyThemeCSSVariables } from './themeStore';

// Export types
export type { ThemeState } from './themeStore';
export type { AuthState } from './authStore';
export type { TicketState } from './ticketStore';
export type { HospitalState } from './hospitalStore';
export type { ChatState } from './chatStore';
