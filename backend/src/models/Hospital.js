import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ["gov", "private", "semi"],
        required: true
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    code: { type: String, required: true, unique: true },
}, { timestamps: true });

const Hospital = mongoose.model("Hospital", hospitalSchema);
export default Hospital;
