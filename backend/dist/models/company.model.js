"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyModel = void 0;
const database_1 = require("../config/database");
class CompanyModel {
    static async getAll() {
        const result = await database_1.pool.query('SELECT * FROM companies ORDER BY name ASC');
        return result.rows;
    }
}
exports.CompanyModel = CompanyModel;
//# sourceMappingURL=company.model.js.map