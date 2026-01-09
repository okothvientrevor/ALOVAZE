import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';

const router: Router = Router();

/**
 * @route   GET /api/companies
 * @desc    Get all companies
 * @access  Public
 */
router.get('/', CompanyController.getAll);

export default router;
