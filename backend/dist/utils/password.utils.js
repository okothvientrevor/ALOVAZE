"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePasswordStrength = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 12;
/**
 * Hash a plain text password
 */
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt_1.default.genSalt(SALT_ROUNDS);
        const hash = await bcrypt_1.default.hash(password, salt);
        return hash;
    }
    catch (error) {
        throw new Error('Error hashing password');
    }
};
exports.hashPassword = hashPassword;
/**
 * Compare plain text password with hashed password
 */
const comparePassword = async (password, hash) => {
    try {
        return await bcrypt_1.default.compare(password, hash);
    }
    catch (error) {
        throw new Error('Error comparing passwords');
    }
};
exports.comparePassword = comparePassword;
/**
 * Validate password strength
 */
const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
};
exports.validatePasswordStrength = validatePasswordStrength;
//# sourceMappingURL=password.utils.js.map