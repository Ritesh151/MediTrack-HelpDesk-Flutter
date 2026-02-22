import User from "./models/User.js";
import Hospital from "./models/Hospital.js";
import mongoose from "mongoose";

const seed = async () => {
    try {
        console.log("Checking for existing users in MongoDB...");
        const userCount = await User.countDocuments();

        if (userCount > 0) {
            console.log("Database already has users. Skipping seeding.");
            return;
        }

        console.log("Seeding data to MongoDB...");

        // 1. Create Sample Hospital
        const hospital = await Hospital.create({
            name: "Delhi Government Hospital",
            type: "gov",
            address: "New Delhi, India",
            city: "Delhi",
            code: "DELGOV"
        });

        // 2. Create Super User
        await User.create({
            name: "Global Super User",
            email: "super@meditrack.com",
            password: "super123",
            role: "super",
            hospitalId: "",
            permissions: [
                "hospitals:read",
                "hospitals:write",
                "users:read",
                "users:write",
                "tickets:read",
                "tickets:assign"
            ],
        });

        // 3. Create Admin for that hospital
        await User.create({
            name: "Hospital Admin",
            email: "admin@meditrack.com",
            password: "admin123",
            role: "admin",
            hospitalId: hospital._id,
            permissions: ["tickets:read", "tickets:reply"],
        });

        console.log("Seeding complete!");
    } catch (error) {
        console.error("Seeding error:", error.message);
    }
};

export default seed;
