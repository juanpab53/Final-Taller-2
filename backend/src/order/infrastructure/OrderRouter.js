import { Router } from 'express';

export function createOrderRouter({ orderController, authMiddleware }) {
  const router = Router();

  router.post('/', authMiddleware, (req, res) => orderController.create(req, res));
  router.get('/', authMiddleware, (req, res) => orderController.listUserOrders(req, res));
  router.get('/:id', authMiddleware, (req, res) => orderController.getById(req, res));

  return router;
}
