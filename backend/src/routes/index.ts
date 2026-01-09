import { Router } from 'express';
import authRoutes from './auth.routes';
import reviewRoutes from './review.routes';
import companyRoutes from './company.routes';

const router: Router = Router();

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
router.use('/auth', authRoutes);

// Review routes
router.use('/reviews', reviewRoutes);

// Company routes
router.use('/companies', companyRoutes);

export default router;
