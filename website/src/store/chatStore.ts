import { create } from 'zustand';
import { 
  Message, 
  CreateMessageRequest, 
  UpdateMessageRequest, 
  ChatRoom, 
  MessageFilter, 
  MessageListResponse,
  TypingIndicator,
  OnlineStatus,
  ChatStats
} from '../models';
import { chatService } from '../services';

interface ChatState {
  // State
  messages: Message[];
  currentChatRoom: ChatRoom | null;
  chatRooms: ChatRoom[];
  typingIndicators: TypingIndicator[];
  onlineStatuses: OnlineStatus[];
  stats: ChatStats | null;
  isLoading: boolean;
  isSending: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  
  // Unread counts
  unreadCounts: { [ticketId: string]: number };
  totalUnreadCount: number;
  
  // Actions
  fetchMessages: (ticketId: string, filter?: MessageFilter) => Promise<void>;
  sendMessage: (messageData: CreateMessageRequest) => Promise<Message | null>;
  updateMessage: (id: string, updateData: UpdateMessageRequest) => Promise<Message | null>;
  deleteMessage: (id: string) => Promise<boolean>;
  markMessageAsRead: (id: string) => Promise<void>;
  markAllMessagesAsRead: (ticketId: string) => Promise<void>;
  fetchChatRooms: () => Promise<void>;
  fetchChatRoomByTicket: (ticketId: string) => Promise<void>;
  createChatRoom: (ticketId: string, participants: string[]) => Promise<void>;
  joinChatRoom: (roomId: string) => Promise<void>;
  leaveChatRoom: (roomId: string) => Promise<void>;
  getUnreadCount: () => Promise<void>;
  getTypingIndicators: (ticketId: string) => Promise<void>;
  setTypingIndicator: (ticketId: string, isTyping: boolean) => Promise<void>;
  getOnlineStatus: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => Promise<void>;
  getChatStats: () => Promise<void>;
  searchMessages: (query: string, ticketId?: string) => Promise<void>;
  clearError: () => void;
  clearCurrentChatRoom: () => void;
  setCurrentPage: (page: number) => void;
  refreshMessages: (ticketId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  currentChatRoom: null,
  chatRooms: [],
  typingIndicators: [],
  onlineStatuses: [],
  stats: null,
  isLoading: false,
  isSending: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  total: 0,
  limit: 50,
  unreadCounts: {},
  totalUnreadCount: 0,

  // Fetch messages
  fetchMessages: async (ticketId: string, filter?: MessageFilter) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await chatService.getMessages(ticketId, filter);
      
      if (response.success && response.data) {
        const { messages, total, totalPages, page: currentPage } = response.data;
        
        set({
          messages,
          total,
          totalPages,
          currentPage,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch messages',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch messages',
        isLoading: false,
      });
    }
  },

  // Send message
  sendMessage: async (messageData: CreateMessageRequest) => {
    set({ isSending: true, error: null });
    
    try {
      const response = await chatService.sendMessage(messageData);
      
      if (response.success && response.data) {
        const newMessage = response.data;
        
        set(state => ({
          messages: [...state.messages, newMessage],
          isSending: false,
        }));
        
        return newMessage;
      } else {
        set({
          error: response.error || 'Failed to send message',
          isSending: false,
        });
        return null;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to send message',
        isSending: false,
      });
      return null;
    }
  },

  // Update message
  updateMessage: async (id: string, updateData: UpdateMessageRequest) => {
    set({ isUpdating: true, error: null });
    
    try {
      const response = await chatService.updateMessage(id, updateData);
      
      if (response.success && response.data) {
        const updatedMessage = response.data;
        
        set(state => ({
          messages: state.messages.map(message => 
            message.id === id ? updatedMessage : message
          ),
          isUpdating: false,
        }));
        
        return updatedMessage;
      } else {
        set({
          error: response.error || 'Failed to update message',
          isUpdating: false,
        });
        return null;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to update message',
        isUpdating: false,
      });
      return null;
    }
  },

  // Delete message
  deleteMessage: async (id: string) => {
    set({ isDeleting: true, error: null });
    
    try {
      const response = await chatService.deleteMessage(id);
      
      if (response.success) {
        set(state => ({
          messages: state.messages.filter(message => message.id !== id),
          isDeleting: false,
        }));
        
        return true;
      } else {
        set({
          error: response.error || 'Failed to delete message',
          isDeleting: false,
        });
        return false;
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to delete message',
        isDeleting: false,
      });
      return false;
    }
  },

  // Mark message as read
  markMessageAsRead: async (id: string) => {
    const response = await chatService.markMessageAsRead(id);
    
    if (response.success && response.data) {
      const updatedMessage = response.data;
      
      set(state => ({
        messages: state.messages.map(message => 
          message.id === id ? updatedMessage : message
        ),
      }));
    }
  },

  // Mark all messages as read
  markAllMessagesAsRead: async (ticketId: string) => {
    const response = await chatService.markAllMessagesAsRead(ticketId);
    
    if (response.success) {
      set(state => ({
        messages: state.messages.map(message => 
          message.ticketId === ticketId ? { ...message, isRead: true } : message
        ),
        unreadCounts: {
          ...state.unreadCounts,
          [ticketId]: 0,
        },
      }));
    }
  },

  // Fetch chat rooms
  fetchChatRooms: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await chatService.getChatRooms();
      
      if (response.success && response.data) {
        set({
          chatRooms: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch chat rooms',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch chat rooms',
        isLoading: false,
      });
    }
  },

  // Fetch chat room by ticket
  fetchChatRoomByTicket: async (ticketId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await chatService.getChatRoomByTicket(ticketId);
      
      if (response.success && response.data) {
        set({
          currentChatRoom: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to fetch chat room',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to fetch chat room',
        isLoading: false,
      });
    }
  },

  // Create chat room
  createChatRoom: async (ticketId: string, participants: string[]) => {
    const response = await chatService.createChatRoom(ticketId, participants);
    
    if (response.success && response.data) {
      const newChatRoom = response.data;
      
      set(state => ({
        chatRooms: [newChatRoom, ...state.chatRooms],
        currentChatRoom: newChatRoom,
      }));
    }
  },

  // Join chat room
  joinChatRoom: async (roomId: string) => {
    const response = await chatService.joinChatRoom(roomId);
    
    if (response.success && response.data) {
      const updatedChatRoom = response.data;
      
      set(state => ({
        chatRooms: state.chatRooms.map(room => 
          room._id === roomId ? updatedChatRoom : room
        ),
        currentChatRoom: state.currentChatRoom?._id === roomId ? updatedChatRoom : state.currentChatRoom,
      }));
    }
  },

  // Leave chat room
  leaveChatRoom: async (roomId: string) => {
    const response = await chatService.leaveChatRoom(roomId);
    
    if (response.success) {
      set(state => ({
        chatRooms: state.chatRooms.map(room => 
          room._id === roomId ? { ...room, isActive: false } : room
        ),
        currentChatRoom: state.currentChatRoom?._id === roomId ? null : state.currentChatRoom,
      }));
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await chatService.getUnreadCount();
      
      if (response.success && response.data) {
        const unreadCounts = response.data;
        const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
        
        set({
          unreadCounts,
          totalUnreadCount,
        });
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  // Get typing indicators
  getTypingIndicators: async (ticketId: string) => {
    try {
      const response = await chatService.getTypingIndicators(ticketId);
      
      if (response.success && response.data) {
        set({ typingIndicators: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch typing indicators:', error);
    }
  },

  // Set typing indicator
  setTypingIndicator: async (ticketId: string, isTyping: boolean) => {
    const response = await chatService.setTypingIndicator(ticketId, isTyping);
    
    if (response.success && response.data) {
      const typingIndicator = response.data;
      
      set(state => ({
        typingIndicators: state.typingIndicators.filter(ind => 
          ind.ticketId !== ticketId || ind.userId !== typingIndicator.userId
        ).concat(isTyping ? [typingIndicator] : []),
      }));
    }
  },

  // Get online status
  getOnlineStatus: async () => {
    try {
      const response = await chatService.getOnlineStatus();
      
      if (response.success && response.data) {
        set({ onlineStatuses: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch online status:', error);
    }
  },

  // Set online status
  setOnlineStatus: async (isOnline: boolean) => {
    const response = await chatService.setOnlineStatus(isOnline);
    
    if (response.success && response.data) {
      const onlineStatus = response.data;
      
      set(state => ({
        onlineStatuses: state.onlineStatuses.filter(status => 
          status.userId !== onlineStatus.userId
        ).concat([onlineStatus]),
      }));
    }
  },

  // Get chat statistics
  getChatStats: async () => {
    try {
      const response = await chatService.getChatStats();
      
      if (response.success && response.data) {
        set({ stats: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch chat stats:', error);
    }
  },

  // Search messages
  searchMessages: async (query: string, ticketId?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await chatService.searchMessages(query, ticketId);
      
      if (response.success && response.data) {
        set({
          messages: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response.error || 'Failed to search messages',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: (error as Error).message || 'Failed to search messages',
        isLoading: false,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear current chat room
  clearCurrentChatRoom: () => {
    set({ currentChatRoom: null });
  },

  // Set current page
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  // Refresh messages
  refreshMessages: async (ticketId: string) => {
    await get().fetchMessages(ticketId);
  },
}));

// Chat store actions for non-react usage
export const chatActions = {
  fetchMessages: (ticketId: string, filter?: MessageFilter) => useChatStore.getState().fetchMessages(ticketId, filter),
  sendMessage: (messageData: CreateMessageRequest) => useChatStore.getState().sendMessage(messageData),
  updateMessage: (id: string, updateData: UpdateMessageRequest) => useChatStore.getState().updateMessage(id, updateData),
  deleteMessage: (id: string) => useChatStore.getState().deleteMessage(id),
  markMessageAsRead: (id: string) => useChatStore.getState().markMessageAsRead(id),
  markAllMessagesAsRead: (ticketId: string) => useChatStore.getState().markAllMessagesAsRead(ticketId),
  fetchChatRooms: () => useChatStore.getState().fetchChatRooms(),
  fetchChatRoomByTicket: (ticketId: string) => useChatStore.getState().fetchChatRoomByTicket(ticketId),
  createChatRoom: (ticketId: string, participants: string[]) => useChatStore.getState().createChatRoom(ticketId, participants),
  joinChatRoom: (roomId: string) => useChatStore.getState().joinChatRoom(roomId),
  leaveChatRoom: (roomId: string) => useChatStore.getState().leaveChatRoom(roomId),
  getUnreadCount: () => useChatStore.getState().getUnreadCount(),
  getTypingIndicators: (ticketId: string) => useChatStore.getState().getTypingIndicators(ticketId),
  setTypingIndicator: (ticketId: string, isTyping: boolean) => useChatStore.getState().setTypingIndicator(ticketId, isTyping),
  getOnlineStatus: () => useChatStore.getState().getOnlineStatus(),
  setOnlineStatus: (isOnline: boolean) => useChatStore.getState().setOnlineStatus(isOnline),
  getChatStats: () => useChatStore.getState().getChatStats(),
  searchMessages: (query: string, ticketId?: string) => useChatStore.getState().searchMessages(query, ticketId),
  clearError: () => useChatStore.getState().clearError(),
  clearCurrentChatRoom: () => useChatStore.getState().clearCurrentChatRoom(),
  setCurrentPage: (page: number) => useChatStore.getState().setCurrentPage(page),
  refreshMessages: (ticketId: string) => useChatStore.getState().refreshMessages(ticketId),
};

// Chat selectors
export const chatSelectors = {
  getMessages: () => useChatStore.getState().messages,
  getCurrentChatRoom: () => useChatStore.getState().currentChatRoom,
  getChatRooms: () => useChatStore.getState().chatRooms,
  getTypingIndicators: () => useChatStore.getState().typingIndicators,
  getOnlineStatuses: () => useChatStore.getState().onlineStatuses,
  getStats: () => useChatStore.getState().stats,
  isLoading: () => useChatStore.getState().isLoading,
  isSending: () => useChatStore.getState().isSending,
  isUpdating: () => useChatStore.getState().isUpdating,
  isDeleting: () => useChatStore.getState().isDeleting,
  getError: () => useChatStore.getState().error,
  getCurrentPage: () => useChatStore.getState().currentPage,
  getTotalPages: () => useChatStore.getState().totalPages,
  getTotal: () => useChatStore.getState().total,
  getLimit: () => useChatStore.getState().limit,
  getUnreadCounts: () => useChatStore.getState().unreadCounts,
  getTotalUnreadCount: () => useChatStore.getState().totalUnreadCount,
  getMessageById: (id: string) => useChatStore.getState().messages.find(message => message.id === id),
  getMessagesByTicket: (ticketId: string) => useChatStore.getState().messages.filter(message => message.ticketId === ticketId),
  getUnreadMessages: () => useChatStore.getState().messages.filter(message => !message.isRead),
  getTypingUsers: (ticketId: string) => useChatStore.getState().typingIndicators.filter(ind => ind.ticketId === ticketId && ind.isTyping),
  getOnlineUsers: () => useChatStore.getState().onlineStatuses.filter(status => status.isOnline),
  getChatRoomById: (roomId: string) => useChatStore.getState().chatRooms.find(room => room._id === roomId),
  getChatRoomByTicket: (ticketId: string) => useChatStore.getState().chatRooms.find(room => room.ticketId === ticketId),
};
