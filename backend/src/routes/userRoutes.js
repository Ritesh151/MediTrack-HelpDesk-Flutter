import express from "express";
import { assignAdmin, getUsers, getAdmins } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/assign-admin", protect, authorize("super"), assignAdmin);
router.get("/", protect, authorize("super"), getUsers);
router.get("/admins", protect, authorize("super"), getAdmins);

export default router;
