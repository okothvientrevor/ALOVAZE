import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.utils';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.utils';
import { UserCreateInput, UserLoginInput } from '../types/user.types';

/**
 * Auth Controller
 * Handles authentication business logic
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, full_name, role }: UserCreateInput & { password: string } = req.body;

      // Check if email already exists
      const emailExists = await UserModel.emailExists(email);
      if (emailExists) {
        res.status(409).json({
          success: false,
          error: 'Email already registered',
          message: 'An account with this email address already exists',
        });
        return;
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        res.status(400).json({
          success: false,
          error: 'Weak password',
          message: 'Password does not meet security requirements',
          details: passwordValidation.errors,
        });
        return;
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Create user
      const user = await UserModel.create({
        email,
        full_name,
        role: role || 'user',
        password_hash,
      } as any);

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Get user profile
      const userProfile = await UserModel.getProfile(user.id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userProfile,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: 'An error occurred during registration',
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: UserLoginInput = req.body;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        });
        return;
      }

      // Check if user is banned
      if (user.is_banned) {
        res.status(403).json({
          success: false,
          error: 'Account banned',
          message: `Your account has been banned. Reason: ${user.ban_reason || 'Violation of terms'}`,
        });
        return;
      }

      // Check if user is active
      if (!user.is_active) {
        res.status(403).json({
          success: false,
          error: 'Account inactive',
          message: 'Your account has been deactivated',
        });
        return;
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        });
        return;
      }

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Get user profile
      const userProfile = await UserModel.getProfile(user.id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userProfile,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: 'An error occurred during login',
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'User not found',
        });
        return;
      }

      // Check if user is banned or inactive
      if (user.is_banned || !user.is_active) {
        res.status(403).json({
          success: false,
          error: 'Account unavailable',
          message: 'Your account is no longer active',
        });
        return;
      }

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          res.status(401).json({
            success: false,
            error: 'Invalid refresh token',
            message: 'Please login again',
          });
          return;
        }
      }

      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: 'Token refresh failed',
        message: 'An error occurred while refreshing token',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const userProfile = await UserModel.getProfile(req.user.userId);

      if (!userProfile) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User profile not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
        message: 'An error occurred while fetching profile',
      });
    }
  }

  /**
   * Logout user (client-side token deletion)
   */
  static async logout(_req: Request, res: Response): Promise<void> {
    // In a stateless JWT system, logout is handled client-side
    // by deleting the tokens from storage
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
}
