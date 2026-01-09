import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../types/user.types';
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Role Authorization Middleware
 * Checks if user has required role
 */
export declare const authorize: (...allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't reject if not
 */
export declare const optionalAuthenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map