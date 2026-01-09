export interface User {
    id: string;
    email: string;
    password_hash: string;
    full_name: string;
    profile_image_url?: string;
    role: 'user' | 'business_owner' | 'admin' | 'moderator';
    bio?: string;
    location?: string;
    website?: string;
    email_verified: boolean;
    is_verified_reviewer: boolean;
    verification_badge?: string;
    total_reviews: number;
    helpful_votes_received: number;
    trust_score: number;
    linkedin_url?: string;
    twitter_handle?: string;
    is_active: boolean;
    is_banned: boolean;
    ban_reason?: string;
    banned_at?: Date;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date;
}
export interface UserCreateInput {
    email: string;
    password: string;
    full_name: string;
    role?: 'user' | 'business_owner';
}
export interface UserLoginInput {
    email: string;
    password: string;
}
export interface UserResponse {
    id: string;
    email: string;
    full_name: string;
    profile_image_url?: string;
    role: string;
    email_verified: boolean;
    is_verified_reviewer: boolean;
    trust_score: number;
    total_reviews: number;
    created_at: Date;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface AuthResponse {
    user: UserResponse;
    accessToken: string;
    refreshToken?: string;
}
//# sourceMappingURL=user.types.d.ts.map