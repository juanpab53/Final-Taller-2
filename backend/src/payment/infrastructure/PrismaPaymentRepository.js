import { prisma } from "../../database/prismaClient.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";
import { PaymentRepository } from "../domain/PaymentRepository.js";

export class PrismaPaymentRepository extends PaymentRepository {
  async save(payment) {
    const created = await prisma.pay.create({
      data: {
        orderId: payment.orderId,
        amount: payment.amount,
        receipt: payment.receipt || '',
        status: payment.status || 'PENDING',
        stripe_checkout_session_id: payment.stripeCheckoutSessionId,
        stripe_payment_intent_id: payment.stripePaymentIntentId,
        currency: payment.currency || 'usd',
      },
    });
    return this._mapToPayment(created);
  }

  async findByOrderId(orderId) {
    const row = await prisma.pay.findUnique({ where: { orderId } });
    return row ? this._mapToPayment(row) : null;
  }

  async findByStripeSessionId(sessionId) {
    const row = await prisma.pay.findFirst({
      where: { stripe_checkout_session_id: sessionId },
      include: { order: true },
    });
    return row ? this._mapToPayment(row) : null;
  }

  async updateStatus(id, status, data = {}) {
    try {
      const updated = await prisma.pay.update({
        where: { id },
        data: { status, ...data },
      });
      return this._mapToPayment(updated);
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Payment not found.');
      throw err;
    }
  }

  async saveStripeEvent(stripeEventId, type) {
    const existing = await prisma.stripe_event.findUnique({
      where: { stripe_event_id: stripeEventId },
    });
    if (existing) return existing;

    return prisma.stripe_event.create({
      data: {
        stripe_event_id: stripeEventId,
        type,
      },
    });
  }

  async hasStripeEvent(stripeEventId) {
    const event = await prisma.stripe_event.findUnique({
      where: { stripe_event_id: stripeEventId },
    });
    return !!event;
  }

  _mapToPayment(row) {
    return {
      id: row.id,
      orderId: row.orderId,
      amount: Number(row.amount),
      receipt: row.receipt,
      status: row.status,
      stripeCheckoutSessionId: row.stripe_checkout_session_id,
      stripePaymentIntentId: row.stripe_payment_intent_id,
      currency: row.currency,
      issuedAt: row.issuedAt,
      paidAt: row.paidAt,
      order: row.order ? { id: row.order.id, state: row.order.state } : null,
    };
  }
}
