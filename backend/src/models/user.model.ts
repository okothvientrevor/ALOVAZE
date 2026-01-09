import { pool } from '../config/database';
import { User, UserCreateInput, UserResponse } from '../types/user.types';

/**
 * User Model - Database operations for users
 */
export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: UserCreateInput & { password_hash: string }): Promise<User> {
    const query = `
      INSERT INTO users (
        email, 
        password_hash, 
        full_name, 
        role
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      userData.email,
      userData.password_hash,
      userData.full_name,
      userData.role || 'user',
    ];

    const result = await pool.query(query, values);
    return result.rows[0] as User;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;

    await pool.query(query, [userId]);
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
  }

  /**
   * Get user profile (without sensitive data)
   */
  static async getProfile(userId: string): Promise<UserResponse | null> {
    const query = `
      SELECT 
        id,
        email,
        full_name,
        profile_image_url,
        role,
        bio,
        location,
        website,
        email_verified,
        is_verified_reviewer,
        verification_badge,
        total_reviews,
        helpful_votes_received,
        trust_score,
        linkedin_url,
        twitter_handle,
        created_at,
        updated_at
      FROM users 
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as UserResponse;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'full_name' | 'bio' | 'location' | 'website' | 'profile_image_url'>>
  ): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    if (updates.full_name !== undefined) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(updates.full_name);
    }

    if (updates.bio !== undefined) {
      fields.push(`bio = $${paramCount++}`);
      values.push(updates.bio);
    }

    if (updates.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(updates.location);
    }

    if (updates.website !== undefined) {
      fields.push(`website = $${paramCount++}`);
      values.push(updates.website);
    }

    if (updates.profile_image_url !== undefined) {
      fields.push(`profile_image_url = $${paramCount++}`);
      values.push(updates.profile_image_url);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] as User;
  }

  /**
   * Ban/Unban user
   */
  static async banUser(userId: string, reason: string): Promise<void> {
    const query = `
      UPDATE users 
      SET 
        is_banned = true,
        ban_reason = $2,
        banned_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await pool.query(query, [userId, reason]);
  }

  static async unbanUser(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET 
        is_banned = false,
        ban_reason = NULL,
        banned_at = NULL
      WHERE id = $1
    `;

    await pool.query(query, [userId]);
  }

  /**
   * Verify user email
   */
  static async verifyEmail(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET email_verified = true
      WHERE id = $1
    `;

    await pool.query(query, [userId]);
  }

  /**
   * Increment total reviews count
   */
  static async incrementReviewCount(userId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET total_reviews = total_reviews + 1
      WHERE id = $1
    `;

    await pool.query(query, [userId]);
  }

  /**
   * Update trust score
   */
  static async updateTrustScore(userId: string, score: number): Promise<void> {
    const query = `
      UPDATE users 
      SET trust_score = $2
      WHERE id = $1
    `;

    await pool.query(query, [userId, score]);
  }
}
