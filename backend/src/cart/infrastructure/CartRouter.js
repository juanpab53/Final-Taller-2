import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';

export function createCartRouter({ cartController, authMiddleware }) {
  const router = Router();

  router.get('/', authMiddleware, asyncHandler((req, res) => cartController.getCart(req, res)));
  router.post('/items', authMiddleware, asyncHandler((req, res) => cartController.addItem(req, res)));
  router.patch('/items/:itemId', authMiddleware, asyncHandler((req, res) => cartController.updateItem(req, res)));
  router.delete('/items/:itemId', authMiddleware, asyncHandler((req, res) => cartController.removeItem(req, res)));

  return router;
}
