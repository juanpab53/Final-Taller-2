import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';

export function createAdminOrderRouter({ adminOrderController, authMiddleware, requireRole }) {
  const router = Router();

  router.get('/', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => adminOrderController.list(req, res)));
  router.patch('/:id/status', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => adminOrderController.updateStatus(req, res)));

  return router;
}
