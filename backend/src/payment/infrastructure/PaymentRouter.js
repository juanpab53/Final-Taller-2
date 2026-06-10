import { Router } from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.js';

export function createPaymentRouter({ paymentController }) {
  const router = Router();

  router.get('/verify', asyncHandler((req, res) => paymentController.verify(req, res)));

  return router;
}
