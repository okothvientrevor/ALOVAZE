import { User, UserCreateInput, UserResponse } from '../types/user.types';
/**
 * User Model - Database operations for users
 */
export declare class UserModel {
    /**
     * Create a new user
     */
    static create(userData: UserCreateInput & {
        password_hash: string;
    }): Promise<User>;
    /**
     * Find user by email
     */
    static findByEmail(email: string): Promise<User | null>;
    /**
     * Find user by ID
     */
    static findById(id: string): Promise<User | null>;
    /**
     * Update last login timestamp
     */
    static updateLastLogin(userId: string): Promise<void>;
    /**
     * Check if email exists
     */
    static emailExists(email: string): Promise<boolean>;
    /**
     * Get user profile (without sensitive data)
     */
    static getProfile(userId: string): Promise<UserResponse | null>;
    /**
     * Update user profile
     */
    static updateProfile(userId: string, updates: Partial<Pick<User, 'full_name' | 'bio' | 'location' | 'website' | 'profile_image_url'>>): Promise<User>;
    /**
     * Ban/Unban user
     */
    static banUser(userId: string, reason: string): Promise<void>;
    static unbanUser(userId: string): Promise<void>;
    /**
     * Verify user email
     */
    static verifyEmail(userId: string): Promise<void>;
    /**
     * Increment total reviews count
     */
    static incrementReviewCount(userId: string): Promise<void>;
    /**
     * Update trust score
     */
    static updateTrustScore(userId: string, score: number): Promise<void>;
}
//# sourceMappingURL=user.model.d.ts.map