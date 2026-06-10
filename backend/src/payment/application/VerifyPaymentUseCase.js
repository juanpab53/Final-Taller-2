export class VerifyPaymentUseCase {
  constructor({ stripeGateway, paymentRepository }) {
    this.stripeGateway = stripeGateway;
    this.paymentRepository = paymentRepository;
  }

  async execute({ sessionId }) {
    const session = await this.stripeGateway.retrieveSession(sessionId);

    const payment = await this.paymentRepository.findByStripeSessionId(sessionId);

    return {
      order: payment?.order ? { id: payment.order.id } : { id: session.metadata?.orderId },
      receipt: payment?.receipt || `${session.paymentIntentId}_${sessionId}`,
      amount: session.amountTotal ? (session.amountTotal / 100).toFixed(2) : '0.00',
      currency: session.currency || 'usd',
      date: payment?.paidAt || payment?.issuedAt || new Date().toISOString(),
    };
  }
}
