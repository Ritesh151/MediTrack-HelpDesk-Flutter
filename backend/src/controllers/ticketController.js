import Ticket from "../models/Ticket.js";
import Hospital from "../models/Hospital.js";
import TicketService from "../services/ticketService.js";
import mongoose from "mongoose";

export const createTicket = async (req, res) => {
    console.log("Create Ticket Request - Body:", req.body);
    console.log("Create Ticket Request - User:", req.user);

    const { issueTitle, description, hospitalId, priority = "medium", category = "general_inquiry" } = req.body;

    try {
        // Validate required fields
        if (!issueTitle || issueTitle.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Issue title is required",
                code: "MISSING_TITLE"
            });
        }

        if (!description || description.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Description is required",
                code: "MISSING_DESCRIPTION"
            });
        }

        // Validate hospitalId - patients must provide it explicitly
        if (!hospitalId || hospitalId.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Hospital selection is required",
                code: "MISSING_HOSPITAL_ID"
            });
        }

        const finalHospitalId = hospitalId.trim();

        // Prepare ticket data
        const ticketData = {
            patientId: req.user.id,
            hospitalId: finalHospitalId,
            issueTitle: issueTitle.trim(),
            description: description.trim(),
            priority,
            category,
            status: "pending"
        };

        console.log("Creating ticket with data:", ticketData);

        const ticket = await TicketService.createTicketWithHistory(
            ticketData,
            req.user.id,
            req.user.role,
            req.user.name
        );

        console.log("Ticket Created Successfully:", {
            id: ticket._id,
            caseNumber: ticket.caseNumber,
            status: ticket.status
        });

        res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            ticket: {
                id: ticket._id,
                caseNumber: ticket.caseNumber,
                issueTitle: ticket.issueTitle,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                category: ticket.category,
                createdAt: ticket.createdAt,
                patientId: ticket.patientId,
                hospitalId: ticket.hospitalId
            }
        });
    } catch (error) {
        console.error("Error creating ticket:", error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(field => ({
                field,
                message: error.errors[field].message
            }));
            
            return res.status(400).json({
                success: false,
                message: "Ticket validation failed",
                code: "VALIDATION_ERROR",
                details: errors
            });
        }
        
        // Handle duplicate case number error
        if (error.code === 11000 && error.keyPattern?.caseNumber) {
            return res.status(409).json({
                success: false,
                message: "Case number conflict. Please try again.",
                code: "DUPLICATE_CASE_NUMBER"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create ticket. Please try again.",
            code: "CREATION_FAILED",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getTickets = async (req, res) => {
    try {
        const { 
            status, 
            priority, 
            category, 
            search, 
            limit = 50, 
            skip = 0, 
            sortBy = 'lastActivityAt', 
            sortOrder = 'desc' 
        } = req.query;

        const filters = {};
        if (status) filters.status = status.split(',');
        if (priority) filters.priority = priority.split(',');
        if (category) filters.category = category.split(',');
        if (search) filters.search = search;
        filters.limit = parseInt(limit);
        filters.skip = parseInt(skip);

        const sort = { field: sortBy, order: sortOrder };

        const tickets = await TicketService.getTicketsWithFilters(
            filters,
            sort,
            req.user.id,
            req.user.role
        );

        res.json(tickets);
    } catch (error) {
        console.error("Error getting tickets:", error.message);
        res.status(500).json({ message: "Error retrieving tickets" });
    }
};

export const getPendingTickets = async (req, res) => {
    const tickets = await Ticket.find({ status: "pending" })
        .populate("patientId", "name email")
        .sort("-createdAt");
    res.json(tickets);
};

export const assignTicket = async (req, res) => {
    const { adminId } = req.body;

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        res.status(400);
        throw new Error("Invalid adminId provided");
    }

    try {
        // Get admin details for history
        const User = (await import("../models/User.js")).default;
        const admin = await User.findById(adminId);
        
        if (!admin) {
            res.status(404);
            throw new Error("Admin not found");
        }

        const ticket = await TicketService.assignTicket(
            req.params.id,
            adminId,
            admin.name,
            req.user.id,
            req.user.role,
            req.user.name
        );

        // Return populated ticket so frontend gets all details
        const populated = await Ticket.findById(ticket._id)
            .populate("patientId", "name email")
            .populate("assignedAdminId", "name email");

        res.json(populated);
    } catch (error) {
        console.error("Error assigning ticket:", error.message);
        if (error.message.includes("not found")) {
            res.status(404);
        } else {
            res.status(500);
        }
        throw new Error(error.message);
    }
};

export const replyToTicket = async (req, res) => {
    const { doctorName, doctorPhone, specialization, replyMessage } = req.body;
    
    try {
        const replyData = {
            doctorName,
            doctorPhone,
            specialization,
            replyMessage,
            repliedBy: req.user.id,
            repliedAt: new Date()
        };

        const ticket = await TicketService.addReplyToHistory(
            req.params.id,
            replyData,
            req.user.id,
            req.user.name
        );

        res.json(ticket);
    } catch (error) {
        console.error("Error replying to ticket:", error.message);
        if (error.message.includes("not found")) {
            res.status(404);
        } else if (error.message.includes("Access denied")) {
            res.status(403);
        } else {
            res.status(500);
        }
        throw new Error(error.message);
    }
};

export const getTicketDetails = async (req, res) => {
    try {
        const ticket = await TicketService.getTicketWithHistory(
            req.params.id,
            req.user.id,
            req.user.role
        );

        res.json(ticket);
    } catch (error) {
        console.error("Error getting ticket details:", error.message);
        if (error.message.includes("not found")) {
            res.status(404);
        } else if (error.message.includes("Access denied")) {
            res.status(403);
        } else {
            res.status(500);
        }
        throw new Error(error.message);
    }
};

export const getStats = async (req, res) => {
    try {
        const ticketStats = await TicketService.getTicketStats(
            req.user.id,
            req.user.role
        );

        // Calculate hospital type distribution
        const hospitalStats = await Hospital.aggregate([
            {
                $group: {
                    _id: "$type",
                    gov: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "gov"] },
                                1,
                                0
                            ]
                        }
                    },
                    private: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "private"] },
                                1,
                                0
                            ]
                        }
                    },
                    semi: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", "semi"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Extract hospital type counts
        const hospitalTypeStats = hospitalStats.length > 0 ? hospitalStats[0] : { gov: 0, private: 0, semi: 0 };
        
        // Remove the _id field from the result
        const { _id, ...statsByType } = hospitalTypeStats;

        res.json({
            ...ticketStats,
            totalHospitals: statsByType.gov + statsByType.private + statsByType.semi,
            statsByType
        });
    } catch (error) {
        console.error("Error getting ticket stats:", error.message);
        res.status(500).json({ 
            success: false,
            message: "Error retrieving stats" 
        });
    }
};

// Legacy support or fallback
export const updateTicket = async (req, res) => {
    const { status } = req.body;
    
    try {
        const ticket = await TicketService.updateTicketStatus(
            req.params.id,
            status,
            req.user.id,
            req.user.role,
            req.user.name
        );
        
        res.json(ticket);
    } catch (error) {
        console.error("Error updating ticket:", error.message);
        if (error.message.includes("not found")) {
            res.status(404);
        } else {
            res.status(500);
        }
        throw new Error(error.message);
    }
};

export const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            res.status(404);
            throw new Error("Ticket not found");
        }
        
        // Add history entry before deletion
        await TicketService.addHistoryEntry(
            req.params.id,
            'resolved',
            req.user.id,
            req.user.role,
            req.user.name,
            `Ticket deleted by ${req.user.name}`
        );
        
        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ message: "Ticket deleted" });
    } catch (error) {
        console.error("Error deleting ticket:", error.message);
        res.status(500).json({ message: "Error deleting ticket" });
    }
};

// New endpoint for updating ticket status
export const updateTicketStatus = async (req, res) => {
    const { status } = req.body;
    
    if (!status || !['pending', 'assigned', 'in_progress', 'resolved', 'closed'].includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
    }
    
    try {
        const ticket = await TicketService.updateTicketStatus(
            req.params.id,
            status,
            req.user.id,
            req.user.role,
            req.user.name
        );
        
        res.json(ticket);
    } catch (error) {
        console.error("Error updating ticket status:", error.message);
        if (error.message.includes("not found")) {
            res.status(404);
        } else {
            res.status(500);
        }
        throw new Error(error.message);
    }
};
