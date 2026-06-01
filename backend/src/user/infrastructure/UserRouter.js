import { Router } from 'express';

export function createUserRouter({ userController, authMiddleware, requireRole }) {
  const router = Router();

  // Registro de usuario público
  router.post('/register', async (req, res, next) => {
    try {
      await userController.register(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  // Perfil protegido; requiere token válido
  router.get('/profile', authMiddleware, requireRole('CLIENT', 'ADMIN'), async (req, res, next) => {
    try {
      await userController.getProfile(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
