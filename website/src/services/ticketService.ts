import { apiService } from './apiService';
import { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  TicketFilter, 
  TicketListResponse, 
  TicketStats,
  ApiResponse 
} from '../models';

export class TicketService {
  private static instance: TicketService;

  private constructor() {}

  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  // Get all tickets with filtering and pagination
  public async getTickets(filter?: TicketFilter): Promise<ApiResponse<TicketListResponse>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/tickets?${queryString}` : '/api/tickets';
    
    return apiService.get<TicketListResponse>(url);
  }

  // Get ticket by ID
  public async getTicketById(id: string): Promise<ApiResponse<Ticket>> {
    return apiService.get<Ticket>(`/api/tickets/${id}`);
  }

  // Create new ticket
  public async createTicket(ticketData: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
    return apiService.post<Ticket>('/api/tickets', ticketData);
  }

  // Update ticket
  public async updateTicket(id: string, updateData: UpdateTicketRequest): Promise<ApiResponse<Ticket>> {
    return apiService.put<Ticket>(`/api/tickets/${id}`, updateData);
  }

  // Delete ticket
  public async deleteTicket(id: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/api/tickets/${id}`);
  }

  // Update ticket status
  public async updateTicketStatus(id: string, status: string): Promise<ApiResponse<Ticket>> {
    return apiService.patch<Ticket>(`/api/tickets/${id}/status`, { status });
  }

  // Assign ticket to admin
  public async assignTicket(id: string, adminId: string): Promise<ApiResponse<Ticket>> {
    return apiService.patch<Ticket>(`/api/tickets/${id}/assign`, { assignedAdminId: adminId });
  }

  // Add reply to ticket
  public async addReply(id: string, replyData: any): Promise<ApiResponse<Ticket>> {
    return apiService.post<Ticket>(`/api/tickets/${id}/reply`, replyData);
  }

  // Get ticket history
  public async getTicketHistory(id: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/api/tickets/${id}/history`);
  }

  // Get ticket statistics
  public async getTicketStats(): Promise<ApiResponse<TicketStats>> {
    return apiService.get<TicketStats>('/api/tickets/stats');
  }

  // Get tickets by user (patient)
  public async getMyTickets(filter?: TicketFilter): Promise<ApiResponse<TicketListResponse>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/tickets/my?${queryString}` : '/api/tickets/my';
    
    return apiService.get<TicketListResponse>(url);
  }

  // Get tickets assigned to admin
  public async getAssignedTickets(filter?: TicketFilter): Promise<ApiResponse<TicketListResponse>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/tickets/assigned?${queryString}` : '/api/tickets/assigned';
    
    return apiService.get<TicketListResponse>(url);
  }

  // Search tickets
  public async searchTickets(query: string, filter?: TicketFilter): Promise<ApiResponse<TicketListResponse>> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'search') {
          params.append(key, String(value));
        }
      });
    }

    return apiService.get<TicketListResponse>(`/api/tickets/search?${params.toString()}`);
  }

  // Get ticket trends
  public async getTicketTrends(days: number = 30): Promise<ApiResponse<any>> {
    return apiService.get(`/api/tickets/trends?days=${days}`);
  }

  // Export tickets
  public async exportTickets(filter?: TicketFilter, format: string = 'csv'): Promise<void> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const url = `/api/tickets/export?${params.toString()}`;
    await apiService.download(url, `tickets.${format}`);
  }

  // Bulk update tickets
  public async bulkUpdateTickets(ticketIds: string[], updateData: UpdateTicketRequest): Promise<ApiResponse<Ticket[]>> {
    return apiService.put<Ticket[]>('/api/tickets/bulk', {
      ticketIds,
      updateData,
    });
  }

  // Bulk delete tickets
  public async bulkDeleteTickets(ticketIds: string[]): Promise<ApiResponse<any>> {
    return apiService.delete('/api/tickets/bulk', {
      data: { ticketIds }
    });
  }

  // Get ticket categories
  public async getTicketCategories(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>('/api/tickets/categories');
  }

  // Get ticket priorities
  public async getTicketPriorities(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>('/api/tickets/priorities');
  }

  // Get ticket statuses
  public async getTicketStatuses(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>('/api/tickets/statuses');
  }

  // Upload attachment for ticket
  public async uploadAttachment(ticketId: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> {
    return apiService.upload(`/api/tickets/${ticketId}/attachments`, file, onProgress);
  }

  // Get ticket attachments
  public async getTicketAttachments(ticketId: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/api/tickets/${ticketId}/attachments`);
  }

  // Delete ticket attachment
  public async deleteTicketAttachment(ticketId: string, attachmentId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/api/tickets/${ticketId}/attachments/${attachmentId}`);
  }

  // Add comment to ticket
  public async addComment(ticketId: string, comment: string): Promise<ApiResponse<any>> {
    return apiService.post(`/api/tickets/${ticketId}/comments`, { comment });
  }

  // Get ticket comments
  public async getTicketComments(ticketId: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/api/tickets/${ticketId}/comments`);
  }

  // Update ticket priority
  public async updateTicketPriority(ticketId: string, priority: string): Promise<ApiResponse<Ticket>> {
    return apiService.patch<Ticket>(`/api/tickets/${ticketId}/priority`, { priority });
  }

  // Close ticket
  public async closeTicket(ticketId: string, reason?: string): Promise<ApiResponse<Ticket>> {
    return apiService.patch<Ticket>(`/api/tickets/${ticketId}/close`, { reason });
  }

  // Reopen ticket
  public async reopenTicket(ticketId: string, reason?: string): Promise<ApiResponse<Ticket>> {
    return apiService.patch<Ticket>(`/api/tickets/${ticketId}/reopen`, { reason });
  }

  // Escalate ticket
  public async escalateTicket(ticketId: string, reason: string): Promise<ApiResponse<Ticket>> {
    return apiService.patch<Ticket>(`/api/tickets/${ticketId}/escalate`, { reason });
  }

  // Get ticket analytics
  public async getTicketAnalytics(filter?: TicketFilter): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/tickets/analytics?${queryString}` : '/api/tickets/analytics';
    
    return apiService.get(url);
  }

  // Get dashboard summary
  public async getDashboardSummary(): Promise<ApiResponse<any>> {
    return apiService.get('/api/tickets/dashboard-summary');
  }

  // Generate case number
  public async generateCaseNumber(): Promise<ApiResponse<{ caseNumber: string }>> {
    return apiService.get<{ caseNumber: string }>('/api/tickets/generate-case-number');
  }
}

// Export singleton instance
export const ticketService = TicketService.getInstance();
