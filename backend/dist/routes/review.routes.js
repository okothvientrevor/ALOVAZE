"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/reviews
 * @desc    Get all reviews
 * @access  Public
 */
router.get('/', review_controller_1.ReviewController.getAll);
/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(validation_middleware_1.validationSchemas.createReview), review_controller_1.ReviewController.create);
/**
 * @route   GET /api/reviews/:reviewId
 * @desc    Get review by ID
 * @access  Public
 */
router.get('/:reviewId', review_controller_1.ReviewController.getById);
/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update review
 * @access  Private (Owner only)
 */
router.put('/:reviewId', auth_middleware_1.authenticate, (0, validation_middleware_1.validate)(validation_middleware_1.validationSchemas.updateReview), review_controller_1.ReviewController.update);
/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete review
 * @access  Private (Owner only)
 */
router.delete('/:reviewId', auth_middleware_1.authenticate, review_controller_1.ReviewController.delete);
/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews by user
 * @access  Public
 */
router.get('/user/:userId', review_controller_1.ReviewController.getByUser);
/**
 * @route   GET /api/reviews/company/:companyId
 * @desc    Get reviews by company
 * @access  Public
 */
router.get('/company/:companyId', review_controller_1.ReviewController.getByCompany);
/**
 * @route   POST /api/reviews/:reviewId/vote
 * @desc    Vote on review (helpful/not helpful)
 * @access  Private
 */
router.post('/:reviewId/vote', auth_middleware_1.authenticate, review_controller_1.ReviewController.voteHelpful);
/**
 * @route   GET /api/reviews/company/:companyId/statistics
 * @desc    Get review statistics for a company
 * @access  Public
 */
router.get('/company/:companyId/statistics', review_controller_1.ReviewController.getStatistics);
exports.default = router;
//# sourceMappingURL=review.routes.js.map