import { Router } from 'express';

export function createAuthorRouter({ authorController, authMiddleware, requireRole }) {
  const router = Router();

  router.get('/', (req, res) => authorController.list(req, res));
  router.get('/:id', (req, res) => authorController.getById(req, res));
  router.post('/', authMiddleware, requireRole('ADMIN'), (req, res) => authorController.create(req, res));
  router.put('/:id', authMiddleware, requireRole('ADMIN'), (req, res) => authorController.update(req, res));
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), (req, res) => authorController.delete(req, res));

  return router;
}
