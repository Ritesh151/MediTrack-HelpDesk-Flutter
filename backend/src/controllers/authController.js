import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

export const registerPatient = async (req, res) => {
    const { name, email, password, hospitalId } = req.body;

    // Validation
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400);
        throw new Error("Invalid input format");
    }

    if (!email || !password || !name) {
        res.status(400);
        throw new Error("Please provide name, email and password");
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Invalid email format");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        role: "patient",
        hospitalId: hospitalId || "",
        permissions: [],
    });

    if (user) {
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hospitalId: user.hospitalId,
            permissions: user.permissions || [],
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
        res.status(400);
        throw new Error("Invalid input format");
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            hospitalId: user.hospitalId,
            permissions: user.permissions || [],
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
};

export const getMe = async (req, res) => {
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        hospitalId: req.user.hospitalId,
        permissions: req.user.permissions || [],
    });
};
