export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  text: string;
  createdAt: string;
  isRead?: boolean;
}

export interface CreateMessageRequest {
  ticketId: string;
  text: string;
  senderId: string;
  senderRole: string;
  senderName: string;
}

export interface UpdateMessageRequest {
  text?: string;
  isRead?: boolean;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  ticketId: string;
  isTyping: boolean;
  lastTypedAt: string;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface ChatRoom {
  _id: string;
  ticketId: string;
  participants: {
    userId: string;
    name: string;
    role: string;
    joinedAt: string;
  }[];
  lastMessage?: Message;
  unreadCount: {
    [userId: string]: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageFilter {
  ticketId?: string;
  senderId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ChatStats {
  totalMessages: number;
  unreadMessages: number;
  activeChats: number;
  averageResponseTime: number;
}

export const messageFromJson = (json: any): Message => {
  return {
    id: json.id ?? json._id ?? '',
    ticketId: json.ticketId ?? '',
    senderId: json.senderId ?? '',
    senderRole: json.senderRole ?? '',
    senderName: json.senderName ?? '',
    text: json.text ?? '',
    createdAt: json.createdAt ?? new Date().toISOString(),
  };
};

export const messageToJson = (message: Message): any => {
  return {
    id: message.id,
    ticketId: message.ticketId,
    senderId: message.senderId,
    senderRole: message.senderRole,
    senderName: message.senderName,
    text: message.text,
    createdAt: message.createdAt,
  };
};
