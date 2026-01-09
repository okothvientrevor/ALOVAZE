export interface Review {
    id: string;
    user_id: string;
    company_id: string;
    rating: number;
    title: string;
    content: string;
    experience_date?: Date;
    purchase_verified: boolean;
    purchase_amount?: number;
    reviewer_location?: string;
    status: 'draft' | 'pending' | 'published' | 'flagged' | 'removed';
    is_featured: boolean;
    flagged_count: number;
    flag_reason?: string;
    helpful_count: number;
    not_helpful_count: number;
    has_company_response: boolean;
    company_response?: string;
    company_response_at?: Date;
    company_responder_name?: string;
    has_images: boolean;
    image_count: number;
    sentiment_score?: number;
    sentiment_label?: string;
    permalink?: string;
    share_count: number;
    view_count: number;
    created_at: Date;
    updated_at: Date;
    published_at?: Date;
    edited_at?: Date;
    review_type?: 'customer' | 'employee' | 'business';
    employment_status?: 'current' | 'former' | 'contract' | 'intern';
    job_title?: string;
    pros?: string;
    cons?: string;
    work_life_balance_rating?: number;
    compensation_rating?: number;
    culture_rating?: number;
    management_rating?: number;
    career_opportunities_rating?: number;
}
export interface ReviewCreateInput {
    company_id: string;
    rating: number;
    title: string;
    content: string;
    pros?: string;
    cons?: string;
    experience_date?: string;
    reviewer_location?: string;
    purchase_verified?: boolean;
    purchase_amount?: number;
    review_type?: 'customer' | 'employee' | 'business';
    employment_status?: 'current' | 'former' | 'contract' | 'intern';
    job_title?: string;
    work_life_balance_rating?: number;
    compensation_rating?: number;
    culture_rating?: number;
    management_rating?: number;
    career_opportunities_rating?: number;
}
export interface ReviewUpdateInput {
    rating?: number;
    title?: string;
    content?: string;
    pros?: string;
    cons?: string;
    experience_date?: string;
    reviewer_location?: string;
    review_type?: 'customer' | 'employee' | 'business';
    employment_status?: 'current' | 'former' | 'contract' | 'intern';
    job_title?: string;
    work_life_balance_rating?: number;
    compensation_rating?: number;
    culture_rating?: number;
    management_rating?: number;
    career_opportunities_rating?: number;
}
export interface ReviewResponse {
    id: string;
    user_id: string;
    company_id: string;
    rating: number;
    title: string;
    content: string;
    experience_date?: Date;
    reviewer_location?: string;
    status: string;
    is_featured: boolean;
    helpful_count: number;
    not_helpful_count: number;
    has_company_response: boolean;
    company_response?: string;
    created_at: Date;
    updated_at: Date;
    published_at?: Date;
    user?: {
        id: string;
        full_name: string;
        profile_image_url?: string;
        is_verified_reviewer: boolean;
    };
    company?: {
        id: string;
        name: string;
        logo_url?: string;
    };
}
export interface ReviewFilters {
    company_id?: string;
    user_id?: string;
    rating?: number;
    status?: string;
    is_featured?: boolean;
    sort_by?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
    page?: number;
    limit?: number;
}
export interface PaginatedReviews {
    reviews: ReviewResponse[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}
//# sourceMappingURL=review.types.d.ts.map