import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

class TicketService {
    // Generate unique sequential case number
    static async generateCaseNumber() {
        try {
            const year = new Date().getFullYear();
            
            // Find the highest case number for the current year
            const lastTicket = await Ticket.findOne({
                caseNumber: { $regex: `^MED-${year}-` }
            })
            .sort({ caseNumber: -1 })
            .select('caseNumber');
            
            let sequenceNumber = 1;
            
            if (lastTicket && lastTicket.caseNumber) {
                // Extract sequence number from existing case number
                const parts = lastTicket.caseNumber.split('-');
                if (parts.length === 3) {
                    sequenceNumber = parseInt(parts[2]) + 1;
                }
            }
            
            // Format with leading zeros (4 digits)
            const paddedSequence = sequenceNumber.toString().padStart(4, '0');
            return `MED-${year}-${paddedSequence}`;
            
        } catch (error) {
            console.error('Error generating case number:', error);
            // Fallback to timestamp-based generation
            const year = new Date().getFullYear();
            const timestamp = Date.now().toString().slice(-4);
            return `MED-${year}-${timestamp}`;
        }
    }
    // Helper function to add history entry to ticket
    static async addHistoryEntry(ticketId, action, actorId, actorRole, actorName, description, additionalData = {}) {
        try {
            const historyEntry = {
                action,
                actorId,
                actorRole,
                actorName,
                description,
                timestamp: new Date(),
                ...additionalData
            };

            await Ticket.findByIdAndUpdate(
                ticketId,
                { 
                    $push: { history: historyEntry },
                    lastActivityAt: new Date(),
                    lastActivityBy: actorId
                }
            );
        } catch (error) {
            console.error('Error adding history entry:', error);
        }
    }

    // Create ticket with initial history
    static async createTicketWithHistory(ticketData, creatorId, creatorRole, creatorName) {
        try {
            // Generate unique case number
            const caseNumber = await this.generateCaseNumber();
            
            // Prepare complete ticket data
            const completeTicketData = {
                ...ticketData,
                caseNumber,
                status: ticketData.status || 'pending',
                lastActivityAt: new Date(),
                lastActivityBy: creatorId
            };

            console.log('Creating ticket with case number:', caseNumber);

            const ticket = new Ticket(completeTicketData);
            await ticket.save();

            // Add initial history entry
            await this.addHistoryEntry(
                ticket._id,
                'created',
                creatorId,
                creatorRole,
                creatorName,
                `Ticket created: ${ticket.issueTitle}`
            );

            console.log('Ticket created successfully with ID:', ticket._id);
            return ticket;
        } catch (error) {
            console.error('Error creating ticket with history:', error);
            throw error;
        }
    }

    // Update ticket status with history
    static async updateTicketStatus(ticketId, newStatus, actorId, actorRole, actorName, previousStatus = null) {
        try {
            const ticket = await Ticket.findById(ticketId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }

            const oldStatus = ticket.status;
            
            // Update ticket
            ticket.status = newStatus;
            ticket.lastActivityAt = new Date();
            ticket.lastActivityBy = actorId;
            
            await ticket.save();

            // Add history entry
            await this.addHistoryEntry(
                ticketId,
                'status_changed',
                actorId,
                actorRole,
                actorName,
                `Status changed from ${oldStatus} to ${newStatus}`,
                { previousStatus: oldStatus, newStatus }
            );

            return ticket;
        } catch (error) {
            console.error('Error updating ticket status:', error);
            throw error;
        }
    }

    // Assign ticket to admin with history
    static async assignTicket(ticketId, adminId, adminName, actorId, actorRole, actorName) {
        try {
            const ticket = await Ticket.findById(ticketId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }

            const previousAdminId = ticket.assignedAdminId;
            
            // Update ticket
            ticket.assignedAdminId = adminId;
            ticket.status = 'assigned';
            ticket.lastActivityAt = new Date();
            ticket.lastActivityBy = actorId;
            
            await ticket.save();

            // Add history entry
            const action = previousAdminId ? 'reassigned' : 'assigned';
            const description = previousAdminId 
                ? `Ticket reassigned to ${adminName}`
                : `Ticket assigned to ${adminName}`;

            await this.addHistoryEntry(
                ticketId,
                action,
                actorId,
                actorRole,
                actorName,
                description
            );

            return ticket;
        } catch (error) {
            console.error('Error assigning ticket:', error);
            throw error;
        }
    }

    // Add message to ticket history
    static async addMessageToHistory(ticketId, senderId, senderRole, senderName, messageContent) {
        try {
            // Add history entry for message
            await this.addHistoryEntry(
                ticketId,
                'message_sent',
                senderId,
                senderRole,
                senderName,
                `Message sent: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`
            );

            return true;
        } catch (error) {
            console.error('Error adding message to history:', error);
            throw error;
        }
    }

    // Add reply to ticket history
    static async addReplyToHistory(ticketId, replyData, adminId, adminName) {
        try {
            const ticket = await Ticket.findById(ticketId);
            if (!ticket) {
                throw new Error('Ticket not found');
            }

            // Update ticket with reply
            ticket.reply = replyData;
            ticket.status = 'resolved';
            ticket.lastActivityAt = new Date();
            ticket.lastActivityBy = adminId;
            
            await ticket.save();

            // Add history entry
            await this.addHistoryEntry(
                ticketId,
                'reply_added',
                adminId,
                'admin',
                adminName,
                `Reply added: ${replyData.replyMessage.substring(0, 50)}${replyData.replyMessage.length > 50 ? '...' : ''}`
            );

            await this.addHistoryEntry(
                ticketId,
                'resolved',
                adminId,
                'admin',
                adminName,
                `Ticket resolved by ${adminName}`
            );

            return ticket;
        } catch (error) {
            console.error('Error adding reply to history:', error);
            throw error;
        }
    }

    // Get ticket with full history
    static async getTicketWithHistory(ticketId, requestingUserId, requestingRole) {
        try {
            let ticket = await Ticket.findById(ticketId)
                .populate('patientId', 'name email')
                .populate('assignedAdminId', 'name email')
                .populate('lastActivityBy', 'name email');

            if (!ticket) {
                throw new Error('Ticket not found');
            }

            // Apply access control
            if (requestingRole === 'patient' && ticket.patientId._id.toString() !== requestingUserId) {
                throw new Error('Access denied');
            }

            if (requestingRole === 'admin' && ticket.hospitalId !== requestingUserId) {
                // Admin can only see tickets from their hospital
                // This would need to be adjusted based on how hospital ID is stored
            }

            // Sort history by timestamp (newest first)
            ticket.history = ticket.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return ticket;
        } catch (error) {
            console.error('Error getting ticket with history:', error);
            throw error;
        }
    }

    // Get tickets with enhanced filtering and sorting
    static async getTicketsWithFilters(filters = {}, sort = {}, requestingUserId, requestingRole) {
        try {
            let query = {};

            // Apply role-based access control
            if (requestingRole === 'patient') {
                query.patientId = requestingUserId;
            } else if (requestingRole === 'admin') {
                // Admins see tickets from their hospital
                // This would need hospital ID from user profile
                query.hospitalId = requestingUserId; // This needs adjustment
            }
            // Super users see all tickets (no additional filter)

            // Apply additional filters
            if (filters.status) {
                query.status = Array.isArray(filters.status) ? { $in: filters.status } : filters.status;
            }

            if (filters.priority) {
                query.priority = Array.isArray(filters.priority) ? { $in: filters.priority } : filters.priority;
            }

            if (filters.category) {
                query.category = Array.isArray(filters.category) ? { $in: filters.category } : filters.category;
            }

            if (filters.search) {
                query.$or = [
                    { issueTitle: { $regex: filters.search, $options: 'i' } },
                    { description: { $regex: filters.search, $options: 'i' } },
                    { caseNumber: { $regex: filters.search, $options: 'i' } }
                ];
            }

            // Apply sorting
            let sortOptions = {};
            if (sort.field) {
                sortOptions[sort.field] = sort.order === 'desc' ? -1 : 1;
            } else {
                // Default sort by last activity
                sortOptions = { lastActivityAt: -1 };
            }

            const tickets = await Ticket.find(query)
                .populate('patientId', 'name email')
                .populate('assignedAdminId', 'name email')
                .populate('lastActivityBy', 'name email')
                .sort(sortOptions)
                .limit(filters.limit || 50)
                .skip(filters.skip || 0);

            return tickets;
        } catch (error) {
            console.error('Error getting tickets with filters:', error);
            throw error;
        }
    }

    // Get ticket statistics
    static async getTicketStats(requestingUserId, requestingRole) {
        try {
            let matchStage = {};

            // Apply role-based filtering
            if (requestingRole === 'patient') {
                matchStage.patientId = { $toObjectId: requestingUserId };
            } else if (requestingRole === 'admin') {
                matchStage.hospitalId = requestingUserId; // This needs adjustment
            }

            const stats = await Ticket.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                        assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
                        in_progress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
                        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
                        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
                        high_priority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
                        emergency_priority: { $sum: { $cond: [{ $eq: ['$priority', 'emergency'] }, 1, 0] } }
                    }
                }
            ]);

            return stats[0] || {
                total: 0,
                pending: 0,
                assigned: 0,
                in_progress: 0,
                resolved: 0,
                closed: 0,
                high_priority: 0,
                emergency_priority: 0
            };
        } catch (error) {
            console.error('Error getting ticket stats:', error);
            throw error;
        }
    }
}

export default TicketService;
