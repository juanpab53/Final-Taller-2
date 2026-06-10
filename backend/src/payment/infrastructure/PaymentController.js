export class PaymentController {
  constructor({ handleStripeWebhookUseCase, verifyPaymentUseCase }) {
    this.handleStripeWebhookUseCase = handleStripeWebhookUseCase;
    this.verifyPaymentUseCase = verifyPaymentUseCase;
  }

  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      return res.status(400).json({ success: false, error: { message: 'Missing stripe-signature header.' } });
    }

    const result = await this.handleStripeWebhookUseCase.execute({
      event: { type: req.body.type, data: req.body.data },
    });

    res.json({ success: true, data: result });
  }

  async verify(req, res) {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ success: false, error: { message: 'session_id is required.' } });
    }

    const data = await this.verifyPaymentUseCase.execute({ sessionId: session_id });
    res.json({ success: true, data });
  }
}
