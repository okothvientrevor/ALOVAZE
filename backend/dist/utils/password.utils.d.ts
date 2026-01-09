/**
 * Hash a plain text password
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Compare plain text password with hashed password
 */
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Validate password strength
 */
export declare const validatePasswordStrength: (password: string) => {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=password.utils.d.ts.map