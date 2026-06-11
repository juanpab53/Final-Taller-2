import Stripe from 'stripe';
import { StripeGateway } from '../domain/StripeGateway.js';

export class StripePaymentGateway extends StripeGateway {
  constructor() {
    super();
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  async createCheckoutSession({ orderId, items, total, currency, successUrl, cancelUrl }) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: `Order #${orderId}`,
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orderId },
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  async retrieveSession(sessionId) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return {
      id: session.id,
      paymentIntentId: session.payment_intent,
      paymentStatus: session.payment_status,
      status: session.status,
      metadata: session.metadata,
      amountTotal: session.amount_total,
      currency: session.currency,
    };
  }

  async verifyWebhookSignature(payload, signature) {
    return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
  }
}
