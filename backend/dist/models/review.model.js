"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
const database_1 = require("../config/database");
/**
 * Review Model - Database operations for reviews
 */
class ReviewModel {
    /**
     * Create a new review
     */
    static async create(userId, reviewData) {
        const query = `
      INSERT INTO reviews (
        user_id,
        company_id,
        rating,
        title,
        content,
        pros,
        cons,
        experience_date,
        review_type,
        employment_status,
        job_title,
        work_life_balance_rating,
        compensation_rating,
        culture_rating,
        management_rating,
        career_opportunities_rating
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
        const values = [
            userId,
            reviewData.company_id,
            reviewData.rating,
            reviewData.title,
            reviewData.content,
            reviewData.pros || null,
            reviewData.cons || null,
            reviewData.experience_date || null,
            reviewData.review_type || 'customer',
            reviewData.employment_status || null,
            reviewData.job_title || null,
            reviewData.work_life_balance_rating || null,
            reviewData.compensation_rating || null,
            reviewData.culture_rating || null,
            reviewData.management_rating || null,
            reviewData.career_opportunities_rating || null,
        ];
        const result = await database_1.pool.query(query, values);
        return result.rows[0];
    }
    /**
     * Find review by ID
     */
    static async findById(reviewId) {
        const query = `
      SELECT r.*, 
        u.full_name as user_name,
        u.profile_image_url as user_image,
        u.is_verified_reviewer,
        c.name as company_name,
        c.logo_url as company_logo
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN companies c ON r.company_id = c.id
      WHERE r.id = $1
    `;
        const result = await database_1.pool.query(query, [reviewId]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    /**
     * Update review
     */
    static async update(reviewId, userId, updates) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        // Build dynamic update query
        if (updates.rating !== undefined) {
            fields.push(`rating = $${paramCount++}`);
            values.push(updates.rating);
        }
        if (updates.title !== undefined) {
            fields.push(`title = $${paramCount++}`);
            values.push(updates.title);
        }
        if (updates.content !== undefined) {
            fields.push(`content = $${paramCount++}`);
            values.push(updates.content);
        }
        if (updates.pros !== undefined) {
            fields.push(`pros = $${paramCount++}`);
            values.push(updates.pros);
        }
        if (updates.cons !== undefined) {
            fields.push(`cons = $${paramCount++}`);
            values.push(updates.cons);
        }
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        fields.push(`edited = true`);
        values.push(reviewId, userId);
        const query = `
      UPDATE reviews 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;
        const result = await database_1.pool.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Review not found or unauthorized');
        }
        return result.rows[0];
    }
    /**
     * Delete review
     */
    static async delete(reviewId, userId) {
        const query = `
      DELETE FROM reviews 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
        const result = await database_1.pool.query(query, [reviewId, userId]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    /**
     * Get reviews by user
     */
    static async findByUser(userId, options = {}) {
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        // Get total count
        const countQuery = 'SELECT COUNT(*) FROM reviews WHERE user_id = $1';
        const countResult = await database_1.pool.query(countQuery, [userId]);
        const total = parseInt(countResult.rows[0].count, 10);
        // Get reviews
        const query = `
      SELECT r.*, 
        c.company_name,
        c.logo_url as company_logo
      FROM reviews r
      LEFT JOIN companies c ON r.company_id = c.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
        const result = await database_1.pool.query(query, [userId, limit, offset]);
        return {
            reviews: result.rows,
            total,
        };
    }
    /**
     * Get reviews by company
     */
    static async findByCompany(companyId, options = {}) {
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        const sortBy = options.sortBy || 'recent';
        // Get total count and average rating
        const statsQuery = `
      SELECT COUNT(*) as count, AVG(rating) as avg_rating 
      FROM reviews 
      WHERE company_id = $1 AND status = 'published'
    `;
        const statsResult = await database_1.pool.query(statsQuery, [companyId]);
        const total = parseInt(statsResult.rows[0].count, 10);
        const averageRating = parseFloat(statsResult.rows[0].avg_rating) || 0;
        // Determine sort order
        let orderBy = 'r.created_at DESC';
        if (sortBy === 'helpful') {
            orderBy = 'r.helpful_count DESC, r.created_at DESC';
        }
        else if (sortBy === 'rating') {
            orderBy = 'r.rating DESC, r.created_at DESC';
        }
        // Get reviews
        const query = `
      SELECT r.*, 
        u.full_name as user_name,
        u.profile_image_url as user_image,
        u.is_verified_reviewer
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.company_id = $1 AND r.status = 'published'
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `;
        const result = await database_1.pool.query(query, [companyId, limit, offset]);
        return {
            reviews: result.rows,
            total,
            averageRating,
        };
    }
    /**
     * Vote on review (helpful/not helpful)
     */
    static async voteHelpful(reviewId, userId, isHelpful) {
        // Check if user already voted
        const checkQuery = `
      SELECT id FROM review_votes 
      WHERE review_id = $1 AND user_id = $2
    `;
        const checkResult = await database_1.pool.query(checkQuery, [reviewId, userId]);
        if (checkResult.rows.length > 0) {
            // Update existing vote
            const updateQuery = `
        UPDATE review_votes 
        SET is_helpful = $3, updated_at = CURRENT_TIMESTAMP
        WHERE review_id = $1 AND user_id = $2
      `;
            await database_1.pool.query(updateQuery, [reviewId, userId, isHelpful]);
        }
        else {
            // Insert new vote
            const insertQuery = `
        INSERT INTO review_votes (review_id, user_id, is_helpful)
        VALUES ($1, $2, $3)
      `;
            await database_1.pool.query(insertQuery, [reviewId, userId, isHelpful]);
        }
        // Update helpful count on review
        await this.updateHelpfulCount(reviewId);
    }
    /**
     * Update helpful count
     */
    static async updateHelpfulCount(reviewId) {
        const query = `
      UPDATE reviews 
      SET helpful_count = (
        SELECT COUNT(*) 
        FROM review_votes 
        WHERE review_id = $1 AND is_helpful = true
      )
      WHERE id = $1
    `;
        await database_1.pool.query(query, [reviewId]);
    }
    /**
     * Check if user can review company
     */
    static async canUserReviewCompany(userId, companyId) {
        const query = `
      SELECT COUNT(*) 
      FROM reviews 
      WHERE user_id = $1 AND company_id = $2
    `;
        const result = await database_1.pool.query(query, [userId, companyId]);
        const count = parseInt(result.rows[0].count, 10);
        // User can only have one review per company
        return count === 0;
    }
    /**
     * Get review statistics
     */
    static async getStatistics(companyId) {
        const query = `
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE company_id = $1 AND status = 'published'
    `;
        const result = await database_1.pool.query(query, [companyId]);
        const row = result.rows[0];
        return {
            total: parseInt(row.total, 10),
            averageRating: parseFloat(row.avg_rating) || 0,
            ratingDistribution: {
                5: parseInt(row.five_star, 10),
                4: parseInt(row.four_star, 10),
                3: parseInt(row.three_star, 10),
                2: parseInt(row.two_star, 10),
                1: parseInt(row.one_star, 10),
            },
        };
    }
    /**
     * Get all reviews
     */
    static async findAll(options = {}) {
        const limit = options.limit || 10;
        const offset = options.offset || 0;
        // Get total count
        const countQuery = 'SELECT COUNT(*) FROM reviews';
        const countResult = await database_1.pool.query(countQuery);
        const total = parseInt(countResult.rows[0].count, 10);
        // Get reviews
        const query = `
      SELECT r.*, 
        u.full_name as user_name,
        u.profile_image_url as user_image,
        u.is_verified_reviewer,
        c.name as company_name,
        c.logo_url as company_logo
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN companies c ON r.company_id = c.id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;
        const result = await database_1.pool.query(query, [limit, offset]);
        return {
            reviews: result.rows,
            total,
        };
    }
}
exports.ReviewModel = ReviewModel;
//# sourceMappingURL=review.model.js.map