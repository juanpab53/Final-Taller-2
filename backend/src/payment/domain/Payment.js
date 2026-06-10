export class Payment {
  constructor({ id, orderId, amount, receipt, status, stripeCheckoutSessionId, stripePaymentIntentId, currency, issuedAt, paidAt }) {
    this.id = id;
    this.orderId = orderId;
    this.amount = amount;
    this.receipt = receipt;
    this.status = status || 'PENDING';
    this.stripeCheckoutSessionId = stripeCheckoutSessionId;
    this.stripePaymentIntentId = stripePaymentIntentId;
    this.currency = currency || 'usd';
    this.issuedAt = issuedAt;
    this.paidAt = paidAt;
  }
}
