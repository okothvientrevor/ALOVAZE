import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validation Middleware Factory
 * Validates request data against a Joi schema
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

/**
 * Common Validation Schemas
 */
export const validationSchemas = {
  // User Registration
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
    full_name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters',
      'any.required': 'Full name is required',
    }),
    role: Joi.string().valid('user', 'business_owner').default('user'),
  }),

  // User Login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Review Creation
  createReview: Joi.object({
    company_id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid company ID format',
      'any.required': 'Company ID is required',
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required',
    }),
    title: Joi.string().min(10).max(200).required().messages({
      'string.min': 'Title must be at least 10 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required',
    }),
    content: Joi.string().min(50).max(5000).required().messages({
      'string.min': 'Review content must be at least 50 characters long',
      'string.max': 'Review content cannot exceed 5000 characters',
      'any.required': 'Review content is required',
    }),
    pros: Joi.string().max(1000).allow('', null),
    cons: Joi.string().max(1000).allow('', null),
    experience_date: Joi.date().max('now').optional(),
  }),

  // Review Update
  updateReview: Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    title: Joi.string().min(10).max(200).optional(),
    content: Joi.string().min(50).max(5000).optional(),
    pros: Joi.string().max(1000).allow('', null),
    cons: Joi.string().max(1000).allow('', null),
  }).min(1), // At least one field must be provided

  // Refresh Token
  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required',
    }),
  }),
};
