import { Router } from 'express';

export function createAuthRouter({ authController }) {
  const router = Router();

  // Login público: recibe email y password
  router.post('/login', async (req, res, next) => {
    try {
      await authController.login(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  // Refresca el token usando refresh token enviado por cookie httpOnly.
  router.post('/refresh', async (req, res, next) => {
    try {
      await authController.refresh(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  // Cierra sesión borrando el refresh token en cookie.
  router.post('/logout', async (req, res, next) => {
    try {
      await authController.logout(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
