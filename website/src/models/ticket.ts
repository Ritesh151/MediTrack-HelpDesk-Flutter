export interface Ticket {
  id: string;
  caseNumber: string;
  patientId: string;
  patient?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedAdminId?: string;
  assignedAdmin?: {
    _id: string;
    name: string;
    email: string;
  };
  issueTitle: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  lastActivityAt?: string;
  lastActivityBy?: {
    _id: string;
    name: string;
    role: string;
  };
  history?: TicketHistory[];
  reply?: TicketReply;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'assigned' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'emergency';

export type TicketCategory = 'general_inquiry' | 'technical_issue' | 'medical_consultation' | 'billing_issue' | 'appointment_request';

export interface TicketHistory {
  action: string;
  actorId: string;
  actorRole: string;
  actorName: string;
  description: string;
  previousStatus?: TicketStatus;
  newStatus?: TicketStatus;
  timestamp: string;
}

export interface TicketReply {
  doctorName: string;
  doctorPhone: string;
  specialization: string;
  replyMessage: string;
  repliedBy: string;
  repliedAt: string;
}

export interface CreateTicketRequest {
  issueTitle: string;
  description: string;
  priority?: TicketPriority;
  category?: TicketCategory;
  hospitalId?: string;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  assignedAdminId?: string;
  priority?: TicketPriority;
  reply?: TicketReply;
}

export interface TicketStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  assigned: number;
  closed: number;
  byDate: { [date: string]: number };
  byPriority: { [priority: string]: number };
  byCategory: { [category: string]: number };
  hospitalStats?: { [type: string]: number };
}

export interface TicketFilter {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  patientId?: string;
  assignedAdminId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const ticketFromJson = (json: any): Ticket => {
  return {
    id: json._id ?? json.id ?? '',
    caseNumber: json.caseNumber ?? '',
    patientId: typeof json.patientId === 'object' ? json.patientId._id : (json.patientId ?? ''),
    patient: typeof json.patientId === 'object' ? json.patientId : null,
    assignedAdminId: typeof json.assignedAdminId === 'object' ? json.assignedAdminId._id : json.assignedAdminId,
    assignedAdmin: typeof json.assignedAdminId === 'object' ? json.assignedAdminId : null,
    issueTitle: json.issueTitle ?? '',
    description: json.description ?? '',
    status: json.status ?? 'pending',
    priority: json.priority ?? 'medium',
    category: json.category ?? 'general_inquiry',
    lastActivityAt: json.lastActivityAt,
    lastActivityBy: json.lastActivityBy,
    history: json.history ? (json.history as any[]).map((h: any) => ticketHistoryFromJson(h)) : undefined,
    reply: json.reply ? ticketReplyFromJson(json.reply) : undefined,
    createdAt: json.createdAt ?? new Date().toISOString(),
    updatedAt: json.updatedAt ?? new Date().toISOString(),
  };
};

export const ticketHistoryFromJson = (json: any): TicketHistory => {
  return {
    action: json.action ?? '',
    actorId: typeof json.actorId === 'object' ? json.actorId._id : (json.actorId ?? ''),
    actorRole: json.actorRole ?? '',
    actorName: json.actorName ?? '',
    description: json.description ?? '',
    previousStatus: json.previousStatus,
    newStatus: json.newStatus,
    timestamp: json.timestamp ?? new Date().toISOString(),
  };
};

export const ticketReplyFromJson = (json: any): TicketReply => {
  return {
    doctorName: json.doctorName ?? '',
    doctorPhone: json.doctorPhone ?? '',
    specialization: json.specialization ?? '',
    replyMessage: json.replyMessage ?? '',
    repliedBy: typeof json.repliedBy === 'object' ? json.repliedBy._id : (json.repliedBy ?? ''),
    repliedAt: json.repliedAt ?? new Date().toISOString(),
  };
};

export const ticketToJson = (ticket: Ticket): any => {
  return {
    id: ticket.id,
    patientId: ticket.patientId,
    assignedAdminId: ticket.assignedAdminId,
    issueTitle: ticket.issueTitle,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    lastActivityAt: ticket.lastActivityAt,
    lastActivityBy: ticket.lastActivityBy,
    history: ticket.history?.map((h) => ticketHistoryToJson(h)),
    reply: ticket.reply ? ticketReplyToJson(ticket.reply) : undefined,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
};

export const ticketHistoryToJson = (history: TicketHistory): any => {
  return {
    action: history.action,
    actorId: history.actorId,
    actorRole: history.actorRole,
    actorName: history.actorName,
    description: history.description,
    previousStatus: history.previousStatus,
    newStatus: history.newStatus,
    timestamp: history.timestamp,
  };
};

export const ticketReplyToJson = (reply: TicketReply): any => {
  return {
    doctorName: reply.doctorName,
    doctorPhone: reply.doctorPhone,
    specialization: reply.specialization,
    replyMessage: reply.replyMessage,
    repliedBy: reply.repliedBy,
    repliedAt: reply.repliedAt,
  };
};
