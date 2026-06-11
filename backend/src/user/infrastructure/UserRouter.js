import { Router } from 'express';

export function createUserRouter({ userController, authMiddleware, requireRole }) {
  const router = Router();

  router.post('/register', (req, res) => userController.register(req, res));
  router.get('/profile', authMiddleware, requireRole('CLIENT', 'ADMIN'), (req, res) => userController.getProfile(req, res));

  return router;
}
