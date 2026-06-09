import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';

export function createUserRouter({ userController, authMiddleware, requireRole }) {
  const router = Router();

  router.post('/register', asyncHandler((req, res) => userController.register(req, res)));
  router.get('/profile', authMiddleware, requireRole('CLIENT', 'ADMIN'), asyncHandler((req, res) => userController.getProfile(req, res)));

  return router;
}
