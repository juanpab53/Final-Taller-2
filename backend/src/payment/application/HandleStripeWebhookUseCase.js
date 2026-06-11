export class HandleStripeWebhookUseCase {
  constructor({ paymentRepository, orderRepository, cartRepository }) {
    this.paymentRepository = paymentRepository;
    this.orderRepository = orderRepository;
    this.cartRepository = cartRepository;
  }

  async execute({ event }) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (this.paymentRepository.hasStripeEvent) {
        const exists = await this.paymentRepository.hasStripeEvent(session.id);
        if (exists) return { received: true, duplicate: true };
      }

      const payment = await this.paymentRepository.findByStripeSessionId(session.id);
      if (!payment) return { received: true, warning: 'Payment not found for session.' };

      if (session.payment_status === 'paid') {
        await this.paymentRepository.updateStatus(payment.id, 'PAID', {
          stripe_payment_intent_id: session.payment_intent,
          receipt: `${session.payment_intent}_${session.id}`,
          paidAt: new Date(),
        });
        await this.orderRepository.updateStatus(payment.orderId, 'PAID');
      }

      if (this.paymentRepository.saveStripeEvent) {
        await this.paymentRepository.saveStripeEvent(session.id, event.type);
      }
    }

    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object;

      const payment = await this.paymentRepository.findByStripeSessionId(session.id);
      if (payment && payment.status === 'PENDING') {
        await this.paymentRepository.updateStatus(payment.id, 'CANCELLED');
        await this.orderRepository.updateStatus(payment.orderId, 'CANCELLED');
        const cartId = session.metadata?.cartId;
        if (cartId) {
          await this.cartRepository.reactivateCart(cartId);
        }
      }

      if (this.paymentRepository.saveStripeEvent) {
        await this.paymentRepository.saveStripeEvent(session.id, event.type);
      }
    }

    return { received: true };
  }
}
