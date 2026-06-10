import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';

export function createOrderRouter({ orderController, authMiddleware }) {
  const router = Router();

  router.post('/', authMiddleware, asyncHandler((req, res) => orderController.create(req, res)));
  router.get('/', authMiddleware, asyncHandler((req, res) => orderController.listUserOrders(req, res)));
  router.get('/:id', authMiddleware, asyncHandler((req, res) => orderController.getById(req, res)));

  return router;
}
