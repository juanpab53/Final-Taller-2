import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';

export function createAuthRouter({ authController }) {
  const router = Router();

  router.post('/login', asyncHandler((req, res) => authController.login(req, res)));
  router.post('/refresh', asyncHandler((req, res) => authController.refresh(req, res)));
  router.post('/logout', asyncHandler((req, res) => authController.logout(req, res)));

  return router;
}
