import { ValidationError } from "../../shared/errors/ValidationError.js";
import { AppError } from "../../shared/errors/AppError.js";

export class CreateOrderUseCase {
  constructor({ cartRepository, bookRepository, orderRepository, paymentRepository, stripeGateway }) {
    this.cartRepository = cartRepository;
    this.bookRepository = bookRepository;
    this.orderRepository = orderRepository;
    this.paymentRepository = paymentRepository;
    this.stripeGateway = stripeGateway;
  }

  async execute({ userId, shipping }) {
    this._validateShipping(shipping);

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
        unitPrice: item.unitPrice || 0,
      });
      await this.bookRepository.updateStock(item.bookId, -item.quantity);
    }

    const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    if (!total || total <= 0) {
      throw new ValidationError('Order total must be greater than zero.');
    }

    const order = await this.orderRepository.save({
      userId,
      total,
      direction,
      state: 'PENDING',
      items,
    });

    const successUrl = `${process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/pages/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}'}`;
    const cancelUrl = `${process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/pages/cart.html'}`;

    let session;
    try {
      session = await this.stripeGateway.createCheckoutSession({
        orderId: order.id,
        cartId: cart.id,
        items,
        total,
        currency: 'usd',
        successUrl,
        cancelUrl,
      });
    } catch (err) {
      console.error('Stripe checkout session creation failed:', err);
      await this.orderRepository.updateStatus(order.id, 'CANCELLED');
      throw new AppError('Payment service unavailable. Please try again.', 502, 'PAYMENT_GATEWAY_ERROR');
    }

    try {
      await this.paymentRepository.save({
        orderId: order.id,
        amount: total,
        receipt: '',
        status: 'PENDING',
        stripeCheckoutSessionId: session.id,
        currency: 'usd',
      });
    } catch (err) {
      await this.orderRepository.updateStatus(order.id, 'CANCELLED');
      throw new AppError('Failed to record payment. Please try again.', 500, 'PAYMENT_SAVE_ERROR');
    }

    await this.cartRepository.completeCart(cart.id);

    return { url: session.url };
  }

  _validateShipping(shipping) {
    if (!shipping || typeof shipping !== 'object') {
      throw new ValidationError('Shipping information is required.');
    }
    const required = ['first', 'last', 'address', 'city', 'state', 'zip'];
    const missing = required.filter(f => !shipping[f] || !shipping[f].trim());
    if (missing.length > 0) {
      throw new ValidationError(`Missing required shipping fields: ${missing.join(', ')}`);
    }
  }
}
