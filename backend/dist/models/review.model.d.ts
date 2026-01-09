import { Review, ReviewCreateInput, ReviewUpdateInput } from '../types/review.types';
/**
 * Review Model - Database operations for reviews
 */
export declare class ReviewModel {
    /**
     * Create a new review
     */
    static create(userId: string, reviewData: ReviewCreateInput): Promise<Review>;
    /**
     * Find review by ID
     */
    static findById(reviewId: string): Promise<Review | null>;
    /**
     * Update review
     */
    static update(reviewId: string, userId: string, updates: ReviewUpdateInput): Promise<Review>;
    /**
     * Delete review
     */
    static delete(reviewId: string, userId: string): Promise<boolean>;
    /**
     * Get reviews by user
     */
    static findByUser(userId: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        reviews: Review[];
        total: number;
    }>;
    /**
     * Get reviews by company
     */
    static findByCompany(companyId: string, options?: {
        limit?: number;
        offset?: number;
        sortBy?: 'recent' | 'helpful' | 'rating';
    }): Promise<{
        reviews: Review[];
        total: number;
        averageRating: number;
    }>;
    /**
     * Vote on review (helpful/not helpful)
     */
    static voteHelpful(reviewId: string, userId: string, isHelpful: boolean): Promise<void>;
    /**
     * Update helpful count
     */
    private static updateHelpfulCount;
    /**
     * Check if user can review company
     */
    static canUserReviewCompany(userId: string, companyId: string): Promise<boolean>;
    /**
     * Get review statistics
     */
    static getStatistics(companyId: string): Promise<{
        total: number;
        averageRating: number;
        ratingDistribution: {
            [key: number]: number;
        };
    }>;
}
//# sourceMappingURL=review.model.d.ts.map