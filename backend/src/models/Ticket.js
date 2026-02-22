import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
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
    issueTitle: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "assigned", "resolved"],
        default: "pending"
    },
    reply: {
        doctorName: String,
        doctorPhone: String,
        specialization: String,
        replyMessage: String,
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        repliedAt: Date,
    },
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
