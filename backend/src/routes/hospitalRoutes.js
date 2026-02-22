import express from "express";
import { addHospital, getHospitals, deleteHospital } from "../controllers/hospitalController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .post(protect, authorize("super"), addHospital)
    .get(getHospitals);

router.route("/:id")
    .delete(protect, authorize("super"), deleteHospital);

export default router;
