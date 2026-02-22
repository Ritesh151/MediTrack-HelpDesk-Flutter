import express from "express";
import {
    createTicket,
    getTickets,
    getPendingTickets,
    assignTicket,
    replyToTicket,
    getTicketDetails,
    deleteTicket,
    getStats
} from "../controllers/ticketController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, authorize("super"), getStats);

router.route("/")
    .post(protect, authorize("patient"), createTicket)
    .get(protect, getTickets);

router.get("/pending", protect, authorize("super"), getPendingTickets);

router.get("/:id", protect, getTicketDetails);

router.patch("/:id/assign", protect, authorize("super"), assignTicket);
router.patch("/:id/reply", protect, authorize("admin"), replyToTicket);

router.delete("/:id", protect, authorize("admin", "super"), deleteTicket);

export default router;
