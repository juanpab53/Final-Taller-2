import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';

export function createBookRouter({ bookController, authMiddleware, requireRole }) {
  const router = Router();

  router.get('/', asyncHandler((req, res) => bookController.list(req, res)));
  router.get('/:id', asyncHandler((req, res) => bookController.getById(req, res)));
  router.post('/', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => bookController.create(req, res)));
  router.put('/:id', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => bookController.update(req, res)));
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => bookController.delete(req, res)));

  return router;
}
