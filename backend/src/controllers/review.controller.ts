import { Request, Response } from 'express';
import { ReviewModel } from '../models/review.model';
import { UserModel } from '../models/user.model';
import { ReviewCreateInput, ReviewUpdateInput } from '../types/review.types';

/**
 * Review Controller
 * Handles review business logic
 */
export class ReviewController {
  /**
   * Create a new review
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const reviewData: ReviewCreateInput = req.body;
      const userId = req.user.userId;

      // Check if user can review this company (one review per company per user)
      const canReview = await ReviewModel.canUserReviewCompany(userId, reviewData.company_id);
      if (!canReview) {
        res.status(409).json({
          success: false,
          error: 'Duplicate review',
          message: 'You have already reviewed this company',
        });
        return;
      }

      // Create review
      const review = await ReviewModel.create(userId, reviewData);

      // Increment user's review count
      await UserModel.incrementReviewCount(userId);

      // Get full review details
      const fullReview = await ReviewModel.findById(review.id);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: fullReview,
      });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create review',
        message: 'An error occurred while creating the review',
      });
    }
  }

  /**
   * Get review by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;

      const review = await ReviewModel.findById(reviewId);

      if (!review) {
        res.status(404).json({
          success: false,
          error: 'Review not found',
          message: 'The requested review does not exist',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error('Get review error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get review',
        message: 'An error occurred while fetching the review',
      });
    }
  }

  /**
   * Update review
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { reviewId } = req.params;
      const updates: ReviewUpdateInput = req.body;
      const userId = req.user.userId;

      // Update review
      const updatedReview = await ReviewModel.update(reviewId, userId, updates);

      // Get full review details
      const fullReview = await ReviewModel.findById(updatedReview.id);

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: fullReview,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Review not found or unauthorized') {
        res.status(404).json({
          success: false,
          error: 'Review not found',
          message: 'Review not found or you do not have permission to update it',
        });
        return;
      }

      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update review',
        message: 'An error occurred while updating the review',
      });
    }
  }

  /**
   * Delete review
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { reviewId } = req.params;
      const userId = req.user.userId;

      const deleted = await ReviewModel.delete(reviewId, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Review not found',
          message: 'Review not found or you do not have permission to delete it',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete review',
        message: 'An error occurred while deleting the review',
      });
    }
  }

  /**
   * Get reviews by user
   */
  static async getByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await ReviewModel.findByUser(userId, { limit, offset });

      res.status(200).json({
        success: true,
        data: {
          reviews: result.reviews,
          pagination: {
            total: result.total,
            limit,
            offset,
            hasMore: offset + limit < result.total,
          },
        },
      });
    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reviews',
        message: 'An error occurred while fetching reviews',
      });
    }
  }

  /**
   * Get reviews by company
   */
  static async getByCompany(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const sortBy = (req.query.sortBy as 'recent' | 'helpful' | 'rating') || 'recent';

      const result = await ReviewModel.findByCompany(companyId, { limit, offset, sortBy });

      res.status(200).json({
        success: true,
        data: {
          reviews: result.reviews,
          averageRating: result.averageRating,
          pagination: {
            total: result.total,
            limit,
            offset,
            hasMore: offset + limit < result.total,
          },
        },
      });
    } catch (error) {
      console.error('Get company reviews error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reviews',
        message: 'An error occurred while fetching reviews',
      });
    }
  }

  /**
   * Vote on review (helpful/not helpful)
   */
  static async voteHelpful(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const { reviewId } = req.params;
      const { isHelpful } = req.body;
      const userId = req.user.userId;

      await ReviewModel.voteHelpful(reviewId, userId, isHelpful);

      res.status(200).json({
        success: true,
        message: 'Vote recorded successfully',
      });
    } catch (error) {
      console.error('Vote helpful error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record vote',
        message: 'An error occurred while recording your vote',
      });
    }
  }

  /**
   * Get review statistics for a company
   */
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;

      const stats = await ReviewModel.getStatistics(companyId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
        message: 'An error occurred while fetching statistics',
      });
    }
  }
}
