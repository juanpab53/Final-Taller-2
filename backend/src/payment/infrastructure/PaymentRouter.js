import { Router } from 'express';

export function createPaymentRouter({ paymentController }) {
  const router = Router();

  router.get('/verify', (req, res) => paymentController.verify(req, res));

  return router;
}
