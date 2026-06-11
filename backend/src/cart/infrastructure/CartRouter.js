import { Router } from 'express';

export function createCartRouter({ cartController, authMiddleware }) {
  const router = Router();

  router.get('/', authMiddleware, (req, res) => cartController.getCart(req, res));
  router.post('/items', authMiddleware, (req, res) => cartController.addItem(req, res));
  router.patch('/items/:itemId', authMiddleware, (req, res) => cartController.updateItem(req, res));
  router.delete('/items/:itemId', authMiddleware, (req, res) => cartController.removeItem(req, res));

  return router;
}
