"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticate = exports.authorize = exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
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
        const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
        // Attach user to request
        req.user = decoded;
        next();
    }
    catch (error) {
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
exports.authenticate = authenticate;
/**
 * Role Authorization Middleware
 * Checks if user has required role
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
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
exports.authorize = authorize;
/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't reject if not
 */
const optionalAuthenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.substring(7)
                : authHeader;
            if (token) {
                try {
                    const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
                    req.user = decoded;
                }
                catch {
                    // Silently fail - optional authentication
                }
            }
        }
        next();
    }
    catch {
        // Silently fail - optional authentication
        next();
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
//# sourceMappingURL=auth.middleware.js.map