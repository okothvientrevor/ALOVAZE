"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/companies
 * @desc    Get all companies
 * @access  Public
 */
router.get('/', company_controller_1.CompanyController.getAll);
exports.default = router;
//# sourceMappingURL=company.routes.js.map