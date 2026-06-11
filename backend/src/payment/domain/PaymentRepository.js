export class PaymentRepository {
  async save(payment) { throw new Error('PaymentRepository.save not implemented.'); }
  async findByOrderId(orderId) { throw new Error('PaymentRepository.findByOrderId not implemented.'); }
  async findByStripeSessionId(sessionId) { throw new Error('PaymentRepository.findByStripeSessionId not implemented.'); }
  async updateStatus(id, status, data) { throw new Error('PaymentRepository.updateStatus not implemented.'); }
  async saveStripeEvent(stripeEventId, type) { throw new Error('PaymentRepository.saveStripeEvent not implemented.'); }
  async hasStripeEvent(stripeEventId) { throw new Error('PaymentRepository.hasStripeEvent not implemented.'); }
}
