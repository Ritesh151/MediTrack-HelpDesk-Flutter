import Hospital from "../models/Hospital.js";

export const addHospital = async (req, res) => {
    const { name, type, address, city } = req.body;

    // Generate simple code from name (e.g., "City Hospital" -> "CITY")
    const code = name.split(" ").map(word => word[0]).join("").toUpperCase().substring(0, 6);

    const hospital = await Hospital.create({
        name,
        type,
        address,
        city,
        code
    });

    res.status(201).json(hospital);
};

export const getHospitals = async (req, res) => {
    const hospitals = await Hospital.find({});
    res.json(hospitals);
};

export const deleteHospital = async (req, res) => {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ message: "Hospital removed" });
};
