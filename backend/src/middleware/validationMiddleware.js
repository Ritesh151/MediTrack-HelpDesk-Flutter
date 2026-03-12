import { body, validationResult } from 'express-validator';

// Validation middleware factory
export const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const errorMessages = errors.array().map(error => ({
            field: error.param,
            message: error.msg,
            value: error.value
        }));

        return res.status(400).json({
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: errorMessages
        });
    };
};

// Common validation rules
export const validateTicketCreation = [
    body('issueTitle')
        .trim()
        .notEmpty()
        .withMessage('Issue title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Issue title must be between 3 and 200 characters')
        .escape(),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters')
        .escape(),
];

export const validateUserRegistration = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .escape(),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('hospitalId')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Hospital ID must be between 1 and 50 characters')
        .escape(),
];

export const validateUserLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

export const validateMessage = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Message content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters')
        .escape(),
];

export const validateTicketReply = [
    body('doctorName')
        .trim()
        .notEmpty()
        .withMessage('Doctor name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Doctor name must be between 2 and 100 characters')
        .escape(),
    body('doctorPhone')
        .trim()
        .notEmpty()
        .withMessage('Doctor phone is required')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('specialization')
        .trim()
        .notEmpty()
        .withMessage('Specialization is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Specialization must be between 2 and 50 characters')
        .escape(),
    body('replyMessage')
        .trim()
        .notEmpty()
        .withMessage('Reply message is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Reply message must be between 10 and 1000 characters')
        .escape(),
];

export const validateHospitalCreation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Hospital name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Hospital name must be between 2 and 100 characters')
        .escape(),
    body('type')
        .trim()
        .notEmpty()
        .withMessage('Hospital type is required')
        .isIn(['gov', 'private', 'semi'])
        .withMessage('Hospital type must be gov, private, or semi'),
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Address must be between 5 and 200 characters')
        .escape(),
    body('city')
        .trim()
        .notEmpty()
        .withMessage('City is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters')
        .escape(),
];
