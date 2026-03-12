import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            
            if (!token) {
                return res.status(401).json({ 
                    message: "Not authorized, token missing",
                    code: "TOKEN_MISSING"
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({ 
                    message: "Not authorized, user not found",
                    code: "USER_NOT_FOUND"
                });
            }

            // Check if user is active (you could add an isActive field to User schema)
            if (user.isActive === false) {
                return res.status(401).json({ 
                    message: "Account is deactivated",
                    code: "ACCOUNT_DEACTIVATED"
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            let message = "Not authorized, token failed";
            let code = "TOKEN_INVALID";
            
            if (error.name === 'TokenExpiredError') {
                message = "Token expired, please login again";
                code = "TOKEN_EXPIRED";
            } else if (error.name === 'JsonWebTokenError') {
                message = "Invalid token format";
                code = "TOKEN_MALFORMED";
            }
            
            return res.status(401).json({ message, code });
        }
    } else {
        return res.status(401).json({ 
            message: "Not authorized, no token provided",
            code: "NO_TOKEN"
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
                code: "AUTHENTICATION_REQUIRED"
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`,
                code: "INSUFFICIENT_PERMISSIONS",
                requiredRole: roles[0],
                currentRole: req.user.role
            });
        }
        next();
    };
};
