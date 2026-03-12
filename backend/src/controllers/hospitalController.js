import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

export const addHospital = async (req, res) => {
    const { name, type, address, city } = req.body;

    try {
        // Generate simple code from name (e.g., "City Hospital" -> "CITY")
        const code = name.split(" ").map(word => word[0]).join("").toUpperCase().substring(0, 6);

        const hospital = await Hospital.create({
            name,
            type,
            address,
            city,
            code
        });

        res.status(201).json({
            success: true,
            message: "Hospital created successfully",
            data: hospital
        });
    } catch (error) {
        console.error('Error creating hospital:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create hospital",
            error: error.message
        });
    }
};

export const getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find({}).sort({ createdAt: -1 });
        res.json({
            success: true,
            message: "Hospitals retrieved successfully",
            data: hospitals
        });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch hospitals",
            error: error.message
        });
    }
};

export const deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate hospital ID format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid hospital ID format",
                code: "INVALID_HOSPITAL_ID"
            });
        }

        // Check if hospital exists
        const hospital = await Hospital.findById(id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
                code: "HOSPITAL_NOT_FOUND"
            });
        }

        // Check for active tickets
        const activeTickets = await Ticket.countDocuments({ 
            hospitalId: hospital.code,
            status: { $in: ['pending', 'assigned', 'in_progress'] }
        });

        if (activeTickets > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete hospital with active tickets",
                code: "ACTIVE_TICKETS_EXIST",
                details: {
                    activeTicketsCount: activeTickets,
                    suggestion: "Please resolve or reassign all active tickets before deleting this hospital"
                }
            });
        }

        // Check for assigned admins
        const assignedAdmins = await User.countDocuments({
            role: "admin",
            hospitalId: hospital.code
        });

        if (assignedAdmins > 0) {
            // Remove hospital reference from assigned admins
            await User.updateMany(
                { role: "admin", hospitalId: hospital.code },
                { $unset: { hospitalId: "" } }
            );
        }

        // Delete the hospital
        await Hospital.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Hospital deleted successfully",
            data: {
                deletedHospitalId: id,
                hospitalName: hospital.name,
                hospitalCode: hospital.code,
                affectedAdmins: assignedAdmins
            }
        });

    } catch (error) {
        console.error('Error deleting hospital:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete hospital",
            code: "DELETION_FAILED",
            error: error.message
        });
    }
};
