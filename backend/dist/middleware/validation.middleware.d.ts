import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
/**
 * Validation Middleware Factory
 * Validates request data against a Joi schema
 */
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Common Validation Schemas
 */
export declare const validationSchemas: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    createReview: Joi.ObjectSchema<any>;
    updateReview: Joi.ObjectSchema<any>;
    refreshToken: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.middleware.d.ts.map