export class StripeGateway {
  async createCheckoutSession({ orderId, items, total, currency }) { throw new Error('StripeGateway.createCheckoutSession not implemented.'); }
  async retrieveSession(sessionId) { throw new Error('StripeGateway.retrieveSession not implemented.'); }
  async verifyWebhookSignature(payload, signature) { throw new Error('StripeGateway.verifyWebhookSignature not implemented.'); }
}
