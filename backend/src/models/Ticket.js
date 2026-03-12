import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    // Unique case number for professional ticketing
    caseNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // Patient and assignment information
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    hospitalId: {
        type: String,
        default: ""
    },
    assignedAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
    // Ticket details
    issueTitle: { type: String, required: true },
    description: { type: String, required: true },
    
    // Enhanced metadata
    priority: {
        type: String,
        enum: ["low", "medium", "high", "emergency"],
        default: "medium"
    },
    category: {
        type: String,
        enum: ["general_inquiry", "appointment", "emergency", "technical", "billing", "medical_record"],
        default: "general_inquiry"
    },
    
    // Status and tracking
    status: {
        type: String,
        enum: ["pending", "assigned", "in_progress", "resolved", "closed"],
        default: "pending"
    },
    
    // Activity tracking
    lastActivityAt: {
        type: Date,
        default: Date.now
    },
    lastActivityBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
    // History timeline
    history: [{
        action: {
            type: String,
            enum: ["created", "assigned", "reassigned", "status_changed", "message_sent", "reply_added", "resolved", "closed"],
            required: true
        },
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        actorRole: {
            type: String,
            enum: ["patient", "admin", "super"],
            required: true
        },
        actorName: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        previousStatus: String,
        newStatus: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Legacy reply field (maintained for compatibility)
    reply: {
        doctorName: String,
        doctorPhone: String,
        specialization: String,
        replyMessage: String,
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        repliedAt: Date,
    },
}, { 
    timestamps: true,
    // Indexes for performance
    index: { patientId: 1, createdAt: -1 },
    index: { hospitalId: 1, status: 1 },
    index: { assignedAdminId: 1, lastActivityAt: -1 },
    index: { caseNumber: 1 },
    index: { status: 1, priority: 1 }
});

// Virtual for formatted case number
ticketSchema.virtual('formattedCaseNumber').get(function() {
    return this.caseNumber;
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
