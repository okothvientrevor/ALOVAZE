import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { JWTPayload } from '../types/user.types';

// Extend Express Request to include user
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
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'No authorization header provided',
        message: 'Please provide a valid access token',
      });
      return;
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Please provide a valid access token',
      });
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Access token expired') {
        res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Your session has expired. Please login again.',
        });
        return;
      }

      if (error.message === 'Invalid access token') {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'The provided token is invalid.',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'An error occurred during authentication',
    });
  }
};

/**
 * Role Authorization Middleware
 * Checks if user has required role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
      return;
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't reject if not
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          req.user = decoded;
        } catch {
          // Silently fail - optional authentication
        }
      }
    }

    next();
  } catch {
    // Silently fail - optional authentication
    next();
  }
};
