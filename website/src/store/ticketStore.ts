import { create } from 'zustand';
import { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  TicketFilter, 
  TicketListResponse, 
  TicketStats,
  TicketStatus,
  TicketPriority,
  TicketCategory
} from '../models';
import { ticketService } from '../services';

interface TicketState {
  // State
  tickets: Ticket[];
  currentTicket: Ticket | null;
  stats: TicketStats | null;
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
  filters: TicketFilter;
  
  // Actions
  fetchTickets: (filter?: TicketFilter, page?: number) => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  createTicket: (ticketData: CreateTicketRequest) => Promise<Ticket | null>;
  updateTicket: (id: string, updateData: UpdateTicketRequest) => Promise<Ticket | null>;
  deleteTicket: (id: string) => Promise<boolean>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<Ticket | null>;
  assignTicket: (id: string, adminId: string) => Promise<Ticket | null>;
  addReply: (id: string, replyData: any) => Promise<Ticket | null>;
  fetchTicketStats: () => Promise<void>;
  fetchMyTickets: (filter?: TicketFilter, page?: number) => Promise<void>;
  fetchAssignedTickets: (filter?: TicketFilter, page?: number) => Promise<void>;
  searchTickets: (query: string, filter?: TicketFilter) => Promise<void>;
  clearError: () => void;
  clearCurrentTicket: () => void;
  setFilters: (filters: TicketFilter) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  refreshTickets: () => Promise<void>;
}

const defaultFilters: TicketFilter = {};

export const useTicketStore = create<TicketState>((set, get) => ({
  // Initial state
  tickets: [],
  currentTicket: null,
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

  // Fetch tickets
  fetchTickets: async (filter?: TicketFilter, page: number = 1) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketService.getTickets({ ...filter, page, limit: get().limit });
      
      if (response.success && response.data) {
        const { tickets, total, totalPages, page: currentPage } = response.data;
        
        set({
          tickets,
          total,
          totalPages,
          currentPage,
          isLoading: false,
          filters: filter || defaultFilters,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch tickets',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch tickets',
        isLoading: false,
      });
    }
  },

  // Fetch ticket by ID
  fetchTicketById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketService.getTicketById(id);
      
      if (response.success && response.data) {
        set({
          currentTicket: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch ticket',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch ticket',
        isLoading: false,
      });
    }
  },

  // Create ticket
  createTicket: async (ticketData: CreateTicketRequest) => {
    set({ isCreating: true, error: null });
    
    try {
      const response = await ticketService.createTicket(ticketData);
      
      if (response.success && response.data) {
        const newTicket = response.data;
        
        set(state => ({
          tickets: [newTicket, ...state.tickets],
          total: state.total + 1,
          isCreating: false,
        }));
        
        return newTicket;
      } else {
        set({
          error: response.error || 'Failed to create ticket',
          isCreating: false,
        });
        return null;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to create ticket',
        isCreating: false,
      });
      return null;
    }
  },

  // Update ticket
  updateTicket: async (id: string, updateData: UpdateTicketRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await ticketService.updateTicket(id, updateData);
      
      if (response.success && response.data) {
        const updatedTicket = response.data;
        
        set(state => ({
          tickets: state.tickets.map(ticket => 
            ticket.id === id ? updatedTicket : ticket
          ),
          currentTicket: state.currentTicket?.id === id ? updatedTicket : state.currentTicket,
          isUpdating: false,
        }));
        
        return updatedTicket;
      } else {
        set({
          error: response.error || 'Failed to update ticket',
          isUpdating: false,
        });
        return null;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to update ticket',
        isUpdating: false,
      });
      return null;
    }
  },

  // Delete ticket
  deleteTicket: async (id: string) => {
    set({ isDeleting: true, error: null });
    
    try {
      const response = await ticketService.deleteTicket(id);
      
      if (response.success) {
        set(state => ({
          tickets: state.tickets.filter(ticket => ticket.id !== id),
          total: state.total - 1,
          currentTicket: state.currentTicket?.id === id ? null : state.currentTicket,
          isDeleting: false,
        }));
        
        return true;
      } else {
        set({
          error: response.error || 'Failed to delete ticket',
          isDeleting: false,
        });
        return false;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to delete ticket',
        isDeleting: false,
      });
      return false;
    }
  },

  // Update ticket status
  updateTicketStatus: async (id: string, status: TicketStatus) => {
    return get().updateTicket(id, { status });
  },

  // Assign ticket
  assignTicket: async (id: string, adminId: string) => {
    return get().updateTicket(id, { assignedAdminId: adminId });
  },

  // Add reply to ticket
  addReply: async (id: string, replyData: any) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await ticketService.addReply(id, replyData);
      
      if (response.success && response.data) {
        const updatedTicket = response.data;
        
        set(state => ({
          tickets: state.tickets.map(ticket => 
            ticket.id === id ? updatedTicket : ticket
          ),
          currentTicket: state.currentTicket?.id === id ? updatedTicket : state.currentTicket,
          isUpdating: false,
        }));
        
        return updatedTicket;
      } else {
        set({
          error: response.error || 'Failed to add reply',
          isUpdating: false,
        });
        return null;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to add reply',
        isUpdating: false,
      });
      return null;
    }
  },

  // Fetch ticket statistics
  fetchTicketStats: async () => {
    try {
      const response = await ticketService.getTicketStats();
      
      if (response.success && response.data) {
        set({ stats: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch ticket stats:', error);
    }
  },

  // Fetch my tickets
  fetchMyTickets: async (filter?: TicketFilter, page: number = 1) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketService.getMyTickets({ ...filter, page, limit: get().limit });
      
      if (response.success && response.data) {
        const { tickets, total, totalPages, page: currentPage } = response.data;
        
        set({
          tickets,
          total,
          totalPages,
          currentPage,
          isLoading: false,
          filters: filter || defaultFilters,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch tickets',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch tickets',
        isLoading: false,
      });
    }
  },

  // Fetch assigned tickets
  fetchAssignedTickets: async (filter?: TicketFilter, page: number = 1) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketService.getAssignedTickets({ ...filter, page, limit: get().limit });
      
      if (response.success && response.data) {
        const { tickets, total, totalPages, page: currentPage } = response.data;
        
        set({
          tickets,
          total,
          totalPages,
          currentPage,
          isLoading: false,
          filters: filter || defaultFilters,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch tickets',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch tickets',
        isLoading: false,
      });
    }
  },

  // Search tickets
  searchTickets: async (query: string, filter?: TicketFilter) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await ticketService.searchTickets(query, filter);
      
      if (response.success && response.data) {
        const { tickets, total, totalPages, page: currentPage } = response.data;
        
        set({
          tickets,
          total,
          totalPages,
          currentPage,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to search tickets',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to search tickets',
        isLoading: false,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear current ticket
  clearCurrentTicket: () => {
    set({ currentTicket: null });
  },

  // Set filters
  setFilters: (filters: TicketFilter) => {
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

  // Refresh tickets
  refreshTickets: async () => {
    const { filters, currentPage } = get();
    await get().fetchTickets(filters, currentPage);
  },
}));

// Ticket store actions for non-react usage
export const ticketActions = {
  fetchTickets: (filter?: TicketFilter, page?: number) => useTicketStore.getState().fetchTickets(filter, page),
  fetchTicketById: (id: string) => useTicketStore.getState().fetchTicketById(id),
  createTicket: (ticketData: CreateTicketRequest) => useTicketStore.getState().createTicket(ticketData),
  updateTicket: (id: string, updateData: UpdateTicketRequest) => useTicketStore.getState().updateTicket(id, updateData),
  deleteTicket: (id: string) => useTicketStore.getState().deleteTicket(id),
  updateTicketStatus: (id: string, status: TicketStatus) => useTicketStore.getState().updateTicketStatus(id, status),
  assignTicket: (id: string, adminId: string) => useTicketStore.getState().assignTicket(id, adminId),
  addReply: (id: string, replyData: any) => useTicketStore.getState().addReply(id, replyData),
  fetchTicketStats: () => useTicketStore.getState().fetchTicketStats(),
  fetchMyTickets: (filter?: TicketFilter, page?: number) => useTicketStore.getState().fetchMyTickets(filter, page),
  fetchAssignedTickets: (filter?: TicketFilter, page?: number) => useTicketStore.getState().fetchAssignedTickets(filter, page),
  searchTickets: (query: string, filter?: TicketFilter) => useTicketStore.getState().searchTickets(query, filter),
  clearError: () => useTicketStore.getState().clearError(),
  clearCurrentTicket: () => useTicketStore.getState().clearCurrentTicket(),
  setFilters: (filters: TicketFilter) => useTicketStore.getState().setFilters(filters),
  resetFilters: () => useTicketStore.getState().resetFilters(),
  setCurrentPage: (page: number) => useTicketStore.getState().setCurrentPage(page),
  refreshTickets: () => useTicketStore.getState().refreshTickets(),
};

// Ticket selectors
export const ticketSelectors = {
  getTickets: () => useTicketStore.getState().tickets,
  getCurrentTicket: () => useTicketStore.getState().currentTicket,
  getStats: () => useTicketStore.getState().stats,
  isLoading: () => useTicketStore.getState().isLoading,
  isCreating: () => useTicketStore.getState().isCreating,
  isUpdating: () => useTicketStore.getState().isUpdating,
  isDeleting: () => useTicketStore.getState().isDeleting,
  getError: () => useTicketStore.getState().error,
  getCurrentPage: () => useTicketStore.getState().currentPage,
  getTotalPages: () => useTicketStore.getState().totalPages,
  getTotal: () => useTicketStore.getState().total,
  getLimit: () => useTicketStore.getState().limit,
  getFilters: () => useTicketStore.getState().filters,
  getTicketById: (id: string) => useTicketStore.getState().tickets.find(ticket => ticket.id === id),
  getTicketsByStatus: (status: TicketStatus) => useTicketStore.getState().tickets.filter(ticket => ticket.status === status),
  getTicketsByPriority: (priority: TicketPriority) => useTicketStore.getState().tickets.filter(ticket => ticket.priority === priority),
  getTicketsByCategory: (category: TicketCategory) => useTicketStore.getState().tickets.filter(ticket => ticket.category === category),
  getPendingTickets: () => useTicketStore.getState().tickets.filter(ticket => ticket.status === 'pending'),
  getInProgressTickets: () => useTicketStore.getState().tickets.filter(ticket => ticket.status === 'in_progress'),
  getResolvedTickets: () => useTicketStore.getState().tickets.filter(ticket => ticket.status === 'resolved'),
  getAssignedTickets: () => useTicketStore.getState().tickets.filter(ticket => ticket.assignedAdminId),
  getUnassignedTickets: () => useTicketStore.getState().tickets.filter(ticket => !ticket.assignedAdminId),
};
