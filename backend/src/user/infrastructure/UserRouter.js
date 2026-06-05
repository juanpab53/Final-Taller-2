import { Router } from 'express';

export function createUserRouter({ userController, authMiddleware, requireRole }) {
  const router = Router();

  // Public user registration endpoint.
  router.post('/register', async (req, res, next) => {
    try {
      await userController.register(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  // Protected profile endpoint; requires a valid token.
  router.get('/profile', authMiddleware, requireRole('CLIENT', 'ADMIN'), async (req, res, next) => {
    try {
      await userController.getProfile(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
