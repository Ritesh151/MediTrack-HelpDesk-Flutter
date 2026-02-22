import express from "express";
import { registerPatient, loginUser, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerPatient);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

export default router;
