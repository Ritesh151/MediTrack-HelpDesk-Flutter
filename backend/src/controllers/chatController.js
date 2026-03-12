import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";
import TicketService from "../services/ticketService.js";

export const sendMessage = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { content } = req.body;
        const senderId = req.user._id;

        // Validate input
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Message content is required" });
        }

        // Check if ticket exists and user has access
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Check if user is authorized to access this ticket
        const isPatient = ticket.patientId.toString() === senderId.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super';
        const isAssignedAdmin = ticket.assignedAdminId && ticket.assignedAdminId.toString() === senderId.toString();

        if (!isPatient && !(isAdmin && req.user.hospitalId === ticket.hospitalId) && !isAssignedAdmin) {
            return res.status(403).json({ message: "Not authorized to access this ticket" });
        }

        // Create message
        const message = await Message.create({
            ticketId,
            senderId,
            content: content.trim()
        });

        // Populate sender details
        await message.populate('senderId', 'name role email');

        // Add history entry for message
        await TicketService.addMessageToHistory(
            ticketId,
            senderId,
            req.user.role,
            req.user.name,
            content.trim()
        );

        // Update ticket status if it's pending and an admin is replying
        if (ticket.status === 'pending' && (isAdmin || isAssignedAdmin)) {
            await TicketService.updateTicketStatus(
                ticketId,
                'assigned',
                senderId,
                req.user.role,
                req.user.name,
                ticket.status
            );
            
            // Assign admin if not already assigned
            if (!ticket.assignedAdminId && (isAdmin || isAssignedAdmin)) {
                await TicketService.assignTicket(
                    ticketId,
                    senderId,
                    req.user.name,
                    req.user.id,
                    req.user.role,
                    req.user.name
                );
            }
        }

        const responseMessage = {
            id: message._id,
            ticketId: message.ticketId,
            senderId: message.senderId._id,
            senderRole: message.senderId.role,
            senderName: message.senderId.name,
            text: message.content,
            createdAt: message.createdAt
        };

        res.status(201).json(responseMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const senderId = req.user._id;

        // Check if ticket exists and user has access
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Check if user is authorized to access this ticket
        const isPatient = ticket.patientId.toString() === senderId.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super';
        const isAssignedAdmin = ticket.assignedAdminId && ticket.assignedAdminId.toString() === senderId.toString();

        if (!isPatient && !(isAdmin && req.user.hospitalId === ticket.hospitalId) && !isAssignedAdmin) {
            return res.status(403).json({ message: "Not authorized to access this ticket" });
        }

        // Get messages for this ticket, sorted by creation date
        const messages = await Message.find({ ticketId })
            .populate('senderId', 'name role email')
            .sort({ createdAt: 1 });

        const responseMessages = messages.map(message => ({
            id: message._id,
            ticketId: message.ticketId,
            senderId: message.senderId._id,
            senderRole: message.senderId.role,
            senderName: message.senderId.name,
            text: message.content,
            createdAt: message.createdAt
        }));

        res.json(responseMessages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: "Server error" });
    }
};
