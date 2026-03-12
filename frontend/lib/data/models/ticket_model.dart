class TicketModel {
  final String id;
  final String caseNumber;
  final String patientId;
  final Map<String, dynamic>? patient; // Populated from backend
  final String? assignedAdminId;
  final Map<String, dynamic>? assignedAdmin; // Populated from backend
  final String issueTitle;
  final String description;
  final String status;
  final String priority;
  final String category;
  final DateTime? lastActivityAt;
  final Map<String, dynamic>? lastActivityBy; // Populated from backend
  final List<TicketHistory>? history;
  final TicketReply? reply;
  final DateTime createdAt;
  final DateTime updatedAt;

  TicketModel({
    required this.id,
    required this.caseNumber,
    required this.patientId,
    this.patient,
    this.assignedAdminId,
    this.assignedAdmin,
    required this.issueTitle,
    required this.description,
    required this.status,
    this.priority = 'medium',
    this.category = 'general_inquiry',
    this.lastActivityAt,
    this.lastActivityBy,
    this.history,
    this.reply,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    return TicketModel(
      id: json['_id'] ?? json['id'] ?? '', // Handle MongoDB _id
      caseNumber: json['caseNumber'] ?? '',
      patientId: json['patientId'] is Map ? json['patientId']['_id'] : (json['patientId'] ?? ''),
      patient: json['patientId'] is Map ? json['patientId'] : null,
      assignedAdminId: json['assignedAdminId'] is Map ? json['assignedAdminId']['_id'] : json['assignedAdminId'],
      assignedAdmin: json['assignedAdminId'] is Map ? json['assignedAdminId'] : null,
      issueTitle: json['issueTitle'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? 'pending',
      priority: json['priority'] ?? 'medium',
      category: json['category'] ?? 'general_inquiry',
      lastActivityAt: json['lastActivityAt'] != null ? DateTime.parse(json['lastActivityAt']) : null,
      lastActivityBy: json['lastActivityBy'],
      history: json['history'] != null ? (json['history'] as List).map((h) => TicketHistory.fromJson(h)).toList() : null,
      reply: json['reply'] != null ? TicketReply.fromJson(json['reply']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patientId': patientId,
      'assignedAdminId': assignedAdminId,
      'issueTitle': issueTitle,
      'description': description,
      'status': status,
      'priority': priority,
      'category': category,
      'lastActivityAt': lastActivityAt?.toIso8601String(),
      'lastActivityBy': lastActivityBy,
      'history': history?.map((h) => h.toJson()).toList(),
      'reply': reply?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class TicketHistory {
  final String action;
  final String actorId;
  final String actorRole;
  final String actorName;
  final String description;
  final String? previousStatus;
  final String? newStatus;
  final DateTime timestamp;

  TicketHistory({
    required this.action,
    required this.actorId,
    required this.actorRole,
    required this.actorName,
    required this.description,
    this.previousStatus,
    this.newStatus,
    required this.timestamp,
  });

  factory TicketHistory.fromJson(Map<String, dynamic> json) {
    return TicketHistory(
      action: json['action'] ?? '',
      actorId: json['actorId'] is Map ? json['actorId']['_id'] : (json['actorId'] ?? ''),
      actorRole: json['actorRole'] ?? '',
      actorName: json['actorName'] ?? '',
      description: json['description'] ?? '',
      previousStatus: json['previousStatus'],
      newStatus: json['newStatus'],
      timestamp: DateTime.parse(json['timestamp'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'action': action,
      'actorId': actorId,
      'actorRole': actorRole,
      'actorName': actorName,
      'description': description,
      'previousStatus': previousStatus,
      'newStatus': newStatus,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class TicketReply {
  final String doctorName;
  final String doctorPhone;
  final String specialization;
  final String replyMessage;
  final String repliedBy;
  final DateTime repliedAt;

  TicketReply({
    required this.doctorName,
    required this.doctorPhone,
    required this.specialization,
    required this.replyMessage,
    required this.repliedBy,
    required this.repliedAt,
  });

  factory TicketReply.fromJson(Map<String, dynamic> json) {
    return TicketReply(
      doctorName: json['doctorName'] ?? '',
      doctorPhone: json['doctorPhone'] ?? '',
      specialization: json['specialization'] ?? '',
      replyMessage: json['replyMessage'] ?? '',
      repliedBy: json['repliedBy'] is Map ? json['repliedBy']['_id'] : (json['repliedBy'] ?? ''),
      repliedAt: DateTime.parse(json['repliedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'doctorName': doctorName,
      'doctorPhone': doctorPhone,
      'specialization': specialization,
      'replyMessage': replyMessage,
      'repliedBy': repliedBy,
      'repliedAt': repliedAt.toIso8601String(),
    };
  }
}
