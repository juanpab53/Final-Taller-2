import { Router } from 'express';

export function createAuthRouter({ authController }) {
  const router = Router();

  // Public login endpoint: receives email and password.
  router.post('/login', async (req, res, next) => {
    try {
      await authController.login(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  // Refresh the access token using the httpOnly refresh token cookie.
  router.post('/refresh', async (req, res, next) => {
    try {
      await authController.refresh(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  // Logout endpoint: clears the refresh token cookie.
  router.post('/logout', async (req, res, next) => {
    try {
      await authController.logout(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
