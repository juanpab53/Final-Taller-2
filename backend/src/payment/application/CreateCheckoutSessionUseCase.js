export class CreateCheckoutSessionUseCase {
  constructor({ orderRepository, stripeGateway }) {
    this.orderRepository = orderRepository;
    this.stripeGateway = stripeGateway;
  }

  async execute({ orderId }) {
    const order = await this.orderRepository.findById(orderId);

    const successUrl = `${process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/pages/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}'}`;
    const cancelUrl = `${process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/pages/cart.html'}`;

    const session = await this.stripeGateway.createCheckoutSession({
      orderId: order.id,
      items: order.items,
      total: order.total,
      currency: 'usd',
      successUrl,
      cancelUrl,
    });

    return { url: session.url };
  }
}
