import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';

export function createCategoryRouter({ categoryController, authMiddleware, requireRole }) {
  const router = Router();

  router.get('/', asyncHandler((req, res) => categoryController.list(req, res)));
  router.get('/:id', asyncHandler((req, res) => categoryController.getById(req, res)));
  router.post('/', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => categoryController.create(req, res)));
  router.put('/:id', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => categoryController.update(req, res)));
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), asyncHandler((req, res) => categoryController.delete(req, res)));

  return router;
}
