import { Router } from 'express';

export function createCategoryRouter({ categoryController, authMiddleware, requireRole }) {
  const router = Router();

  router.get('/', (req, res) => categoryController.list(req, res));
  router.get('/:id', (req, res) => categoryController.getById(req, res));
  router.post('/', authMiddleware, requireRole('ADMIN'), (req, res) => categoryController.create(req, res));
  router.put('/:id', authMiddleware, requireRole('ADMIN'), (req, res) => categoryController.update(req, res));
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), (req, res) => categoryController.delete(req, res));

  return router;
}
