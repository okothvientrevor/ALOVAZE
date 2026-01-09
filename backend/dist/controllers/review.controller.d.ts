import { Request, Response } from 'express';
/**
 * Review Controller
 * Handles review business logic
 */
export declare class ReviewController {
    /**
     * Create a new review
     */
    static create(req: Request, res: Response): Promise<void>;
    /**
     * Get review by ID
     */
    static getById(req: Request, res: Response): Promise<void>;
    /**
     * Update review
     */
    static update(req: Request, res: Response): Promise<void>;
    /**
     * Delete review
     */
    static delete(req: Request, res: Response): Promise<void>;
    /**
     * Get reviews by user
     */
    static getByUser(req: Request, res: Response): Promise<void>;
    /**
     * Get reviews by company
     */
    static getByCompany(req: Request, res: Response): Promise<void>;
    /**
     * Vote on review (helpful/not helpful)
     */
    static voteHelpful(req: Request, res: Response): Promise<void>;
    /**
     * Get review statistics for a company
     */
    static getStatistics(req: Request, res: Response): Promise<void>;
    /**
     * Get all reviews
     */
    static getAll(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=review.controller.d.ts.map