"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.generateTokenPair = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
/**
 * Generate Access Token
 * Short-lived token for API authentication
 */
const generateAccessToken = (payload) => {
    const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
    };
    return jsonwebtoken_1.default.sign(tokenPayload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate Refresh Token
 * Long-lived token for refreshing access tokens
 */
const generateRefreshToken = (payload) => {
    const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
    };
    return jsonwebtoken_1.default.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Access token expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid access token');
        }
        throw error;
    }
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Refresh token expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid refresh token');
        }
        throw error;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Generate both tokens
 */
const generateTokenPair = (payload) => {
    return {
        accessToken: (0, exports.generateAccessToken)(payload),
        refreshToken: (0, exports.generateRefreshToken)(payload),
    };
};
exports.generateTokenPair = generateTokenPair;
/**
 * Decode token without verification (for debugging)
 */
const decodeToken = (token) => {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch {
        return null;
    }
};
exports.decodeToken = decodeToken;
//# sourceMappingURL=jwt.utils.js.map