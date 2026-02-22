import Ticket from "../models/Ticket.js";
import mongoose from "mongoose";

export const createTicket = async (req, res) => {
    console.log("Create Ticket Request - Body:", req.body);
    console.log("Create Ticket Request - User:", req.user);

    const { issueTitle, description } = req.body;

    try {
        const ticket = await Ticket.create({
            patientId: req.user.id,
            hospitalId: req.user.hospitalId || "",
            issueTitle,
            description,
            status: "pending",
        });

        console.log("Ticket Created Successfully:", ticket._id);
        res.status(201).json(ticket);
    } catch (error) {
        console.error("Error creating ticket:", error.message);
        res.status(400);
        throw new Error(error.message);
    }
};

export const getTickets = async (req, res) => {
    // Patient sees only their own tickets.
    if (req.user.role === "patient") {
        const tickets = await Ticket.find({ patientId: req.user.id })
            .populate("patientId", "name email")
            .populate("assignedAdminId", "name")
            .sort("-createdAt");

        res.json(tickets);
        return;
    }

    // Admin sees:
    // - tickets assigned to them
    // - tickets that belong to their hospital
    // - legacy tickets created before Ticket.hospitalId existed (ticket.hospitalId empty)
    //   by matching the patient's hospitalId
    if (req.user.role === "admin") {
        const adminId = new mongoose.Types.ObjectId(req.user.id);
        const adminHospitalId = req.user.hospitalId || "";

        const tickets = await Ticket.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "patientId",
                    foreignField: "_id",
                    as: "patient",
                },
            },
            { $unwind: "$patient" },
            {
                $match: {
                    $or: [
                        { assignedAdminId: adminId },
                        { hospitalId: adminHospitalId },
                        {
                            $and: [
                                {
                                    $or: [
                                        { hospitalId: { $exists: false } },
                                        { hospitalId: "" },
                                        { hospitalId: null },
                                    ],
                                },
                                { "patient.hospitalId": adminHospitalId },
                            ],
                        },
                    ],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "assignedAdminId",
                    foreignField: "_id",
                    as: "assignedAdmin",
                },
            },
            {
                $unwind: {
                    path: "$assignedAdmin",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    patientId: {
                        _id: "$patient._id",
                        name: "$patient.name",
                        email: "$patient.email",
                    },
                    assignedAdminId: {
                        _id: "$assignedAdmin._id",
                        name: "$assignedAdmin.name",
                    },
                    hospitalId: 1,
                    issueTitle: 1,
                    description: 1,
                    status: 1,
                    reply: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);

        res.json(tickets);
        return;
    }

    // Super user sees all tickets.
    const tickets = await Ticket.find({})
        .populate("patientId", "name email")
        .populate("assignedAdminId", "name")
        .sort("-createdAt");

    res.json(tickets);
};

export const getPendingTickets = async (req, res) => {
    const tickets = await Ticket.find({ status: "pending" })
        .populate("patientId", "name email")
        .sort("-createdAt");
    res.json(tickets);
};

export const assignTicket = async (req, res) => {
    const { adminId } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error("Ticket not found");
    }

    ticket.assignedAdminId = adminId;
    ticket.status = "assigned";
    await ticket.save();

    res.json(ticket);
};

export const replyToTicket = async (req, res) => {
    const { doctorName, doctorPhone, specialization, replyMessage } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error("Ticket not found");
    }

    if (ticket.assignedAdminId.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error("Only the assigned admin can reply to this ticket");
    }

    ticket.reply = {
        doctorName,
        doctorPhone,
        specialization,
        replyMessage,
        repliedBy: req.user.id,
        repliedAt: new Date(),
    };
    ticket.status = "resolved";
    await ticket.save();

    res.json(ticket);
};

export const getTicketDetails = async (req, res) => {
    const ticket = await Ticket.findById(req.params.id)
        .populate("patientId", "name email")
        .populate("assignedAdminId", "name")
        .populate("reply.repliedBy", "name");

    if (!ticket) {
        res.status(404);
        throw new Error("Ticket not found");
    }

    res.json(ticket);
};

export const getStats = async (req, res) => {
    const totalTickets = await Ticket.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: "pending" });
    const resolvedTickets = await Ticket.countDocuments({ status: "resolved" });

    // Calculate stats by hospital type
    // We need to join with User (patients) and then with Hospital to get the type
    // However, since hospitalId might be a simple string or an ObjectId, 
    // and Ticket only has patientId, we aggregate based on the patient's hospital type.

    const stats = await Ticket.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "patientId",
                foreignField: "_id",
                as: "patient"
            }
        },
        { $unwind: "$patient" },
        {
            $lookup: {
                from: "hospitals",
                let: { hId: "$patient.hospitalId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$code", "$$hId"] },
                                    {
                                        $and: [
                                            { $eq: [{ $strLenCP: "$$hId" }, 24] },
                                            { $eq: ["$_id", { $toObjectId: "$$hId" }] }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "hospital"
            }
        },
        { $unwind: "$hospital" },
        {
            $group: {
                _id: "$hospital.type",
                count: { $sum: 1 }
            }
        }
    ]);

    const statsByType = {
        gov: 0,
        private: 0,
        semi: 0
    };

    stats.forEach(item => {
        if (statsByType.hasOwnProperty(item._id)) {
            statsByType[item._id] = item.count;
        }
    });

    res.json({
        totalTickets,
        pendingTickets,
        resolvedTickets,
        statsByType
    });
};

// Legacy support or fallback
export const updateTicket = async (req, res) => {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ticket);
};

export const deleteTicket = async (req, res) => {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted" });
};
