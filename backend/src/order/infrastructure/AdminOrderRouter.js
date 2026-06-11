import { Router } from 'express';

export function createAdminOrderRouter({ adminOrderController, authMiddleware, requireRole }) {
  const router = Router();

  router.get('/stats', authMiddleware, requireRole('ADMIN'), (req, res) => adminOrderController.getStats(req, res));
  router.get('/', authMiddleware, requireRole('ADMIN'), (req, res) => adminOrderController.list(req, res));
  router.patch('/:id/status', authMiddleware, requireRole('ADMIN'), (req, res) => adminOrderController.updateStatus(req, res));

  return router;
}
