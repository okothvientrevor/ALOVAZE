"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemas = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Validation Middleware Factory
 * Validates request data against a Joi schema
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
        });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: errors,
            });
            return;
        }
        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};
exports.validate = validate;
/**
 * Common Validation Schemas
 */
exports.validationSchemas = {
    // User Registration
    register: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
        password: joi_1.default.string().min(8).required().messages({
            'string.min': 'Password must be at least 8 characters long',
            'any.required': 'Password is required',
        }),
        full_name: joi_1.default.string().min(2).max(100).required().messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 100 characters',
            'any.required': 'Full name is required',
        }),
        role: joi_1.default.string().valid('user', 'business_owner').default('user'),
    }),
    // User Login
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    }),
    // Review Creation
    createReview: joi_1.default.object({
        company_id: joi_1.default.string().uuid().required().messages({
            'string.guid': 'Invalid company ID format',
            'any.required': 'Company ID is required',
        }),
        rating: joi_1.default.number().integer().min(1).max(5).required().messages({
            'number.min': 'Rating must be between 1 and 5',
            'number.max': 'Rating must be between 1 and 5',
            'any.required': 'Rating is required',
        }),
        title: joi_1.default.string().min(10).max(200).required().messages({
            'string.min': 'Title must be at least 10 characters long',
            'string.max': 'Title cannot exceed 200 characters',
            'any.required': 'Title is required',
        }),
        content: joi_1.default.string().min(50).max(5000).required().messages({
            'string.min': 'Review content must be at least 50 characters long',
            'string.max': 'Review content cannot exceed 5000 characters',
            'any.required': 'Review content is required',
        }),
        pros: joi_1.default.string().max(1000).allow('', null),
        cons: joi_1.default.string().max(1000).allow('', null),
        experience_date: joi_1.default.date().max('now').optional(),
    }),
    // Review Update
    updateReview: joi_1.default.object({
        rating: joi_1.default.number().integer().min(1).max(5).optional(),
        title: joi_1.default.string().min(10).max(200).optional(),
        content: joi_1.default.string().min(50).max(5000).optional(),
        pros: joi_1.default.string().max(1000).allow('', null),
        cons: joi_1.default.string().max(1000).allow('', null),
    }).min(1), // At least one field must be provided
    // Refresh Token
    refreshToken: joi_1.default.object({
        refreshToken: joi_1.default.string().required().messages({
            'any.required': 'Refresh token is required',
        }),
    }),
};
//# sourceMappingURL=validation.middleware.js.map