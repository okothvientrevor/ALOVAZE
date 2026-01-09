import { Request, Response } from 'express';
/**
 * Auth Controller
 * Handles authentication business logic
 */
export declare class AuthController {
    /**
     * Register a new user
     */
    static register(req: Request, res: Response): Promise<void>;
    /**
     * Login user
     */
    static login(req: Request, res: Response): Promise<void>;
    /**
     * Refresh access token
     */
    static refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * Get current user profile
     */
    static getProfile(req: Request, res: Response): Promise<void>;
    /**
     * Logout user (client-side token deletion)
     */
    static logout(_req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map