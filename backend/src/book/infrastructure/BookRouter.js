import { Router } from 'express';

export function createBookRouter({ bookController, authMiddleware, requireRole }) {
  const router = Router();

  router.get('/', (req, res) => bookController.list(req, res));
  router.get('/:id', (req, res) => bookController.getById(req, res));
  router.post('/', authMiddleware, requireRole('ADMIN'), (req, res) => bookController.create(req, res));
  router.put('/:id', authMiddleware, requireRole('ADMIN'), (req, res) => bookController.update(req, res));
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), (req, res) => bookController.delete(req, res));

  return router;
}
