import { pool } from '../config/database';

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  created_at: Date;
  updated_at: Date;
}

export class CompanyModel {
  static async getAll(): Promise<Company[]> {
    const result = await pool.query('SELECT * FROM companies ORDER BY name ASC');
    return result.rows;
  }
}
