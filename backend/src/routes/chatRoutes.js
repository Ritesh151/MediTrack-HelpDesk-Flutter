import express from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:ticketId")
    .post(protect, sendMessage)
    .get(protect, getMessages);

export default router;
