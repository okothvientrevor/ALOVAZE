import { JWTPayload } from '../types/user.types';
/**
 * Generate Access Token
 * Short-lived token for API authentication
 */
export declare const generateAccessToken: (payload: JWTPayload) => string;
/**
 * Generate Refresh Token
 * Long-lived token for refreshing access tokens
 */
export declare const generateRefreshToken: (payload: JWTPayload) => string;
/**
 * Verify Access Token
 */
export declare const verifyAccessToken: (token: string) => JWTPayload;
/**
 * Verify Refresh Token
 */
export declare const verifyRefreshToken: (token: string) => JWTPayload;
/**
 * Generate both tokens
 */
export declare const generateTokenPair: (payload: JWTPayload) => {
    accessToken: string;
    refreshToken: string;
};
/**
 * Decode token without verification (for debugging)
 */
export declare const decodeToken: (token: string) => JWTPayload | null;
//# sourceMappingURL=jwt.utils.d.ts.map