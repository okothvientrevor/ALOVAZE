"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const company_model_1 = require("../models/company.model");
class CompanyController {
    static async getAll(_req, res) {
        try {
            const companies = await company_model_1.CompanyModel.getAll();
            res.json(companies);
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch companies', error });
        }
    }
}
exports.CompanyController = CompanyController;
//# sourceMappingURL=company.controller.js.map