import { apiService } from './apiService';
import { 
  Message, 
  CreateMessageRequest, 
  UpdateMessageRequest, 
  ChatRoom, 
  MessageFilter, 
  MessageListResponse,
  TypingIndicator,
  OnlineStatus,
  ChatStats,
  ApiResponse 
} from '../models';

export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Get messages for a ticket
  public async getMessages(ticketId: string, filter?: MessageFilter): Promise<ApiResponse<MessageListResponse>> {
    const params = new URLSearchParams();
    params.append('ticketId', ticketId);
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'ticketId') {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/chat/messages?${queryString}` : `/api/chat/messages?ticketId=${ticketId}`;
    
    return apiService.get<MessageListResponse>(url);
  }

  // Send message
  public async sendMessage(messageData: CreateMessageRequest): Promise<ApiResponse<Message>> {
    return apiService.post<Message>('/api/chat/messages', messageData);
  }

  // Update message
  public async updateMessage(id: string, updateData: UpdateMessageRequest): Promise<ApiResponse<Message>> {
    return apiService.put<Message>(`/api/chat/messages/${id}`, updateData);
  }

  // Delete message
  public async deleteMessage(id: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/api/chat/messages/${id}`);
  }

  // Mark message as read
  public async markMessageAsRead(id: string): Promise<ApiResponse<Message>> {
    return apiService.patch<Message>(`/api/chat/messages/${id}/read`);
  }

  // Mark all messages in ticket as read
  public async markAllMessagesAsRead(ticketId: string): Promise<ApiResponse<any>> {
    return apiService.patch(`/api/chat/messages/mark-read`, { ticketId });
  }

  // Get chat rooms for user
  public async getChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    return apiService.get<ChatRoom[]>('/api/chat/rooms');
  }

  // Get chat room by ticket ID
  public async getChatRoomByTicket(ticketId: string): Promise<ApiResponse<ChatRoom>> {
    return apiService.get<ChatRoom>(`/api/chat/rooms/ticket/${ticketId}`);
  }

  // Create chat room
  public async createChatRoom(ticketId: string, participants: string[]): Promise<ApiResponse<ChatRoom>> {
    return apiService.post<ChatRoom>('/api/chat/rooms', {
      ticketId,
      participants,
    });
  }

  // Join chat room
  public async joinChatRoom(roomId: string): Promise<ApiResponse<ChatRoom>> {
    return apiService.post<ChatRoom>(`/api/chat/rooms/${roomId}/join`);
  }

  // Leave chat room
  public async leaveChatRoom(roomId: string): Promise<ApiResponse<any>> {
    return apiService.post(`/api/chat/rooms/${roomId}/leave`);
  }

  // Get unread message count
  public async getUnreadCount(): Promise<ApiResponse<{ [ticketId: string]: number }>> {
    return apiService.get('/api/chat/unread-count');
  }

  // Get typing indicators
  public async getTypingIndicators(ticketId: string): Promise<ApiResponse<TypingIndicator[]>> {
    return apiService.get<TypingIndicator[]>(`/api/chat/typing/${ticketId}`);
  }

  // Set typing indicator
  public async setTypingIndicator(ticketId: string, isTyping: boolean): Promise<ApiResponse<TypingIndicator>> {
    return apiService.post<TypingIndicator>(`/api/chat/typing`, {
      ticketId,
      isTyping,
    });
  }

  // Get online status
  public async getOnlineStatus(): Promise<ApiResponse<OnlineStatus[]>> {
    return apiService.get<OnlineStatus[]>('/api/chat/online-status');
  }

  // Set online status
  public async setOnlineStatus(isOnline: boolean): Promise<ApiResponse<OnlineStatus>> {
    return apiService.post<OnlineStatus>('/api/chat/online-status', { isOnline });
  }

  // Get chat statistics
  public async getChatStats(): Promise<ApiResponse<ChatStats>> {
    return apiService.get<ChatStats>('/api/chat/stats');
  }

  // Search messages
  public async searchMessages(query: string, ticketId?: string): Promise<ApiResponse<Message[]>> {
    const params = new URLSearchParams();
    params.append('query', query);
    if (ticketId) {
      params.append('ticketId', ticketId);
    }

    return apiService.get<Message[]>(`/api/chat/search?${params.toString()}`);
  }

  // Get message by ID
  public async getMessageById(id: string): Promise<ApiResponse<Message>> {
    return apiService.get<Message>(`/api/chat/messages/${id}`);
  }

  // Forward message
  public async forwardMessage(messageId: string, ticketId: string): Promise<ApiResponse<Message>> {
    return apiService.post<Message>(`/api/chat/messages/${messageId}/forward`, { ticketId });
  }

  // Reply to message
  public async replyToMessage(messageId: string, text: string): Promise<ApiResponse<Message>> {
    return apiService.post<Message>(`/api/chat/messages/${messageId}/reply`, { text });
  }

  // Upload file message
  public async uploadFileMessage(ticketId: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<Message>> {
    return apiService.upload(`/api/chat/messages/upload`, file, onProgress);
  }

  // Download file from message
  public async downloadFile(messageId: string): Promise<void> {
    return apiService.download(`/api/chat/messages/${messageId}/download`);
  }

  // Get file info
  public async getFileInfo(messageId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/api/chat/messages/${messageId}/file-info`);
  }

  // Delete file from message
  public async deleteFile(messageId: string): Promise<ApiResponse<Message>> {
    return apiService.delete<Message>(`/api/chat/messages/${messageId}/file`);
  }

  // Get message reactions
  public async getMessageReactions(messageId: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/api/chat/messages/${messageId}/reactions`);
  }

  // Add reaction to message
  public async addReaction(messageId: string, emoji: string): Promise<ApiResponse<any>> {
    return apiService.post(`/api/chat/messages/${messageId}/reactions`, { emoji });
  }

  // Remove reaction from message
  public async removeReaction(messageId: string, emoji: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/api/chat/messages/${messageId}/reactions/${emoji}`);
  }

  // Get chat history for ticket
  public async getChatHistory(ticketId: string, limit?: number): Promise<ApiResponse<Message[]>> {
    const params = new URLSearchParams();
    params.append('ticketId', ticketId);
    if (limit) {
      params.append('limit', String(limit));
    }

    return apiService.get<Message[]>(`/api/chat/history?${params.toString()}`);
  }

  // Archive chat room
  public async archiveChatRoom(roomId: string): Promise<ApiResponse<ChatRoom>> {
    return apiService.patch<ChatRoom>(`/api/chat/rooms/${roomId}/archive`);
  }

  // Unarchive chat room
  public async unarchiveChatRoom(roomId: string): Promise<ApiResponse<ChatRoom>> {
    return apiService.patch<ChatRoom>(`/api/chat/rooms/${roomId}/unarchive`);
  }

  // Mute chat room
  public async muteChatRoom(roomId: string): Promise<ApiResponse<ChatRoom>> {
    return apiService.patch<ChatRoom>(`/api/chat/rooms/${roomId}/mute`);
  }

  // Unmute chat room
  public async unmuteChatRoom(roomId: string): Promise<ApiResponse<ChatRoom>> {
    return apiService.patch<ChatRoom>(`/api/chat/rooms/${roomId}/unmute`);
  }

  // Get muted chat rooms
  public async getMutedChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    return apiService.get<ChatRoom[]>('/api/chat/rooms/muted');
  }

  // Get archived chat rooms
  public async getArchivedChatRooms(): Promise<ApiResponse<ChatRoom[]>> {
    return apiService.get<ChatRoom[]>('/api/chat/rooms/archived');
  }

  // Get chat room participants
  public async getChatRoomParticipants(roomId: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/api/chat/rooms/${roomId}/participants`);
  }

  // Add participant to chat room
  public async addParticipant(roomId: string, userId: string): Promise<ApiResponse<any>> {
    return apiService.post(`/api/chat/rooms/${roomId}/participants`, { userId });
  }

  // Remove participant from chat room
  public async removeParticipant(roomId: string, userId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/api/chat/rooms/${roomId}/participants/${userId}`);
  }

  // Get chat room settings
  public async getChatRoomSettings(roomId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/api/chat/rooms/${roomId}/settings`);
  }

  // Update chat room settings
  public async updateChatRoomSettings(roomId: string, settings: any): Promise<ApiResponse<any>> {
    return apiService.put(`/api/chat/rooms/${roomId}/settings`, settings);
  }

  // Get chat analytics
  public async getChatAnalytics(filter?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/api/chat/analytics?${queryString}` : '/api/chat/analytics';
    
    return apiService.get(url);
  }

  // Export chat history
  public async exportChatHistory(ticketId: string, format: string = 'csv'): Promise<void> {
    const url = `/api/chat/export/${ticketId}?format=${format}`;
    await apiService.download(url, `chat-history-${ticketId}.${format}`);
  }

  // Clear chat history
  public async clearChatHistory(ticketId: string): Promise<ApiResponse<any>> {
    return apiService.delete(`/api/chat/history/${ticketId}`);
  }

  // Get chat room activity
  public async getChatRoomActivity(roomId: string): Promise<ApiResponse<any[]>> {
    return apiService.get(`/api/chat/rooms/${roomId}/activity`);
  }

  // Get message delivery status
  public async getMessageDeliveryStatus(messageId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/api/chat/messages/${messageId}/delivery-status`);
  }

  // Report message
  public async reportMessage(messageId: string, reason: string): Promise<ApiResponse<any>> {
    return apiService.post(`/api/chat/messages/${messageId}/report`, { reason });
  }

  // Block user in chat
  public async blockUser(userId: string): Promise<ApiResponse<any>> {
    return apiService.post('/api/chat/block', { userId });
  }

  // Unblock user in chat
  public async unblockUser(userId: string): Promise<ApiResponse<any>> {
    return apiService.post('/api/chat/unblock', { userId });
  }

  // Get blocked users
  public async getBlockedUsers(): Promise<ApiResponse<any[]>> {
    return apiService.get('/api/chat/blocked');
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
