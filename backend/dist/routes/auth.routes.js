"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (0, validation_middleware_1.validate)(validation_middleware_1.validationSchemas.register), auth_controller_1.AuthController.register);
/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (0, validation_middleware_1.validate)(validation_middleware_1.validationSchemas.login), auth_controller_1.AuthController.login);
/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', (0, validation_middleware_1.validate)(validation_middleware_1.validationSchemas.refreshToken), auth_controller_1.AuthController.refreshToken);
/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', auth_middleware_1.authenticate, auth_controller_1.AuthController.getProfile);
/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map