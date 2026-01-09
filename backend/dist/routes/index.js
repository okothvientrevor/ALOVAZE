"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const review_routes_1 = __importDefault(require("./review.routes"));
const company_routes_1 = __importDefault(require("./company.routes"));
const router = (0, express_1.Router)();
/**
 * API Routes
 */
// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
    });
});
// Authentication routes
router.use('/auth', auth_routes_1.default);
// Review routes
router.use('/reviews', review_routes_1.default);
// Company routes
router.use('/companies', company_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map