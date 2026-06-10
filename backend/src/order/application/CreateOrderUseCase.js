import { ValidationError } from "../../shared/errors/ValidationError.js";

export class CreateOrderUseCase {
  constructor({ cartRepository, bookRepository, orderRepository, paymentRepository, stripeGateway }) {
    this.cartRepository = cartRepository;
    this.bookRepository = bookRepository;
    this.orderRepository = orderRepository;
    this.paymentRepository = paymentRepository;
    this.stripeGateway = stripeGateway;
  }

  async execute({ userId, shipping }) {
    const cart = await this.cartRepository.findActiveByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ValidationError('Cart is empty.');
    }

    const direction = JSON.stringify(shipping);

    const items = [];
    for (const item of cart.items) {
      const book = await this.bookRepository.findById(item.bookId);
      if (!book) throw new ValidationError(`Book ${item.bookId} not found.`);
      if (book.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for "${book.name}". Available: ${book.stock}`);
      }
      items.push({
        bookId: item.bookId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
      await this.bookRepository.updateStock(item.bookId, -item.quantity);
    }

    const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const order = await this.orderRepository.save({
      userId,
      total,
      direction,
      state: 'PENDING',
      items,
    });

    await this.cartRepository.completeCart(cart.id);

    const successUrl = `${process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/pages/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}'}`;
    const cancelUrl = `${process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/pages/cart.html'}`;

    const session = await this.stripeGateway.createCheckoutSession({
      orderId: order.id,
      items,
      total,
      currency: 'usd',
      successUrl,
      cancelUrl,
    });

    await this.paymentRepository.save({
      orderId: order.id,
      amount: total,
      receipt: '',
      status: 'PENDING',
      stripeCheckoutSessionId: session.id,
      currency: 'usd',
    });

    return { url: session.url };
  }
}
