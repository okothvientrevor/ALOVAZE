import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, validationSchemas } from '../middleware/validation.middleware';

const router: Router = Router();

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', authenticate, validate(validationSchemas.createReview), ReviewController.create);

/**
 * @route   GET /api/reviews/:reviewId
 * @desc    Get review by ID
 * @access  Public
 */
router.get('/:reviewId', ReviewController.getById);

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update review
 * @access  Private (Owner only)
 */
router.put('/:reviewId', authenticate, validate(validationSchemas.updateReview), ReviewController.update);

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete review
 * @access  Private (Owner only)
 */
router.delete('/:reviewId', authenticate, ReviewController.delete);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews by user
 * @access  Public
 */
router.get('/user/:userId', ReviewController.getByUser);

/**
 * @route   GET /api/reviews/company/:companyId
 * @desc    Get reviews by company
 * @access  Public
 */
router.get('/company/:companyId', ReviewController.getByCompany);

/**
 * @route   POST /api/reviews/:reviewId/vote
 * @desc    Vote on review (helpful/not helpful)
 * @access  Private
 */
router.post('/:reviewId/vote', authenticate, ReviewController.voteHelpful);

/**
 * @route   GET /api/reviews/company/:companyId/statistics
 * @desc    Get review statistics for a company
 * @access  Public
 */
router.get('/company/:companyId/statistics', ReviewController.getStatistics);

export default router;
