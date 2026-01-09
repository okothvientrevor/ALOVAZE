import { Request, Response } from 'express';
import { CompanyModel } from '../models/company.model';

export class CompanyController {
  static async getAll(_req: Request, res: Response) {
    try {
      const companies = await CompanyModel.getAll();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch companies', error });
    }
  }
}
