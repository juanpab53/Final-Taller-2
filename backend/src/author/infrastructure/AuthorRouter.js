import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';

export function createAuthorRouter({ authorController, authMiddleware, requireRole }) {
  const router = Router();

  router.get('/', asyncHandler((req, res) => authorController.list(req, res)));
  router.get('/:id', asyncHandler((req, res) => authorController.getById(req, res)));
  router.post('/', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => authorController.create(req, res)));
  router.put('/:id', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => authorController.update(req, res)));
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => authorController.delete(req, res)));

  return router;
}
