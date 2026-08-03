import { describe, it, expect, vi } from 'vitest';
import { CreateCheckoutSessionUseCase } from '../../../src/payment/application/CreateCheckoutSessionUseCase.js';
import { HandleStripeWebhookUseCase } from '../../../src/payment/application/HandleStripeWebhookUseCase.js';
import { VerifyPaymentUseCase } from '../../../src/payment/application/VerifyPaymentUseCase.js';

describe('CreateCheckoutSessionUseCase', () => {
  it('crea la sesión de checkout y devuelve la url', async () => {
    const orderRepository = { findById: vi.fn().mockResolvedValue({ id: 'o1', items: [], total: 20 }) };
    const stripeGateway = { createCheckoutSession: vi.fn().mockResolvedValue({ id: 'cs_1', url: 'https://pay' }) };
    const uc = new CreateCheckoutSessionUseCase({ orderRepository, stripeGateway });

    const result = await uc.execute({ orderId: 'o1' });

    expect(stripeGateway.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 'o1', total: 20, currency: 'usd' })
    );
    expect(result).toEqual({ url: 'https://pay' });
  });
});

describe('HandleStripeWebhookUseCase', () => {
  const baseDeps = () => ({
    paymentRepository: {
      findByStripeSessionId: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue(undefined),
      hasStripeEvent: vi.fn(),
      saveStripeEvent: vi.fn().mockResolvedValue(undefined),
    },
    orderRepository: { updateStatus: vi.fn().mockResolvedValue(undefined) },
    cartRepository: { reactivateCart: vi.fn().mockResolvedValue(undefined) },
  });

  it('detecta eventos duplicados', async () => {
    const deps = baseDeps();
    deps.paymentRepository.hasStripeEvent.mockResolvedValue(true);
    const uc = new HandleStripeWebhookUseCase(deps);
    const result = await uc.execute({ event: { type: 'checkout.session.completed', data: { object: { id: 'cs_1' } } } });
    expect(result).toEqual({ received: true, duplicate: true });
  });

  it('marca advertencia si el pago no existe en session completada', async () => {
    const deps = baseDeps();
    deps.paymentRepository.findByStripeSessionId.mockResolvedValue(null);
    const uc = new HandleStripeWebhookUseCase(deps);
    const result = await uc.execute({ event: { type: 'checkout.session.completed', data: { object: { id: 'cs_1' } } } });
    expect(result).toEqual({ received: true, warning: 'Payment not found for session.' });
  });

  it('marca PAID el pago y la orden en session pagada', async () => {
    const deps = baseDeps();
    deps.paymentRepository.findByStripeSessionId.mockResolvedValue({ id: 'p1', orderId: 'o1' });
    const uc = new HandleStripeWebhookUseCase(deps);
    const session = { id: 'cs_1', payment_status: 'paid', payment_intent: 'pi_1' };

    const result = await uc.execute({ event: { type: 'checkout.session.completed', data: { object: session } } });

    expect(deps.paymentRepository.updateStatus).toHaveBeenCalledWith(
      'p1',
      'PAID',
      expect.objectContaining({ stripe_payment_intent_id: 'pi_1' })
    );
    expect(deps.orderRepository.updateStatus).toHaveBeenCalledWith('o1', 'PAID');
    expect(deps.paymentRepository.saveStripeEvent).toHaveBeenCalledWith('cs_1', 'checkout.session.completed');
    expect(result).toEqual({ received: true });
  });

  it('cancela pago, orden y reactiva el carrito en sesión expirada', async () => {
    const deps = baseDeps();
    deps.paymentRepository.findByStripeSessionId.mockResolvedValue({ id: 'p1', orderId: 'o1', status: 'PENDING' });
    const uc = new HandleStripeWebhookUseCase(deps);
    const session = { id: 'cs_1', metadata: { cartId: 'c1' } };

    const result = await uc.execute({ event: { type: 'checkout.session.expired', data: { object: session } } });

    expect(deps.paymentRepository.updateStatus).toHaveBeenCalledWith('p1', 'CANCELLED');
    expect(deps.orderRepository.updateStatus).toHaveBeenCalledWith('o1', 'CANCELLED');
    expect(deps.cartRepository.reactivateCart).toHaveBeenCalledWith('c1');
    expect(result).toEqual({ received: true });
  });

  it('ignora eventos desconocidos', async () => {
    const deps = baseDeps();
    const uc = new HandleStripeWebhookUseCase(deps);
    const result = await uc.execute({ event: { type: 'unknown.event', data: { object: {} } } });
    expect(deps.paymentRepository.updateStatus).not.toHaveBeenCalled();
    expect(result).toEqual({ received: true });
  });
});

describe('VerifyPaymentUseCase', () => {
  it('arma el detalle de pago con valores de stripe y del repositorio', async () => {
    const stripeGateway = {
      retrieveSession: vi.fn().mockResolvedValue({
        paymentIntentId: 'pi_1',
        amountTotal: 2500,
        currency: 'usd',
        metadata: { orderId: 'o1' },
      }),
    };
    const paymentRepository = {
      findByStripeSessionId: vi.fn().mockResolvedValue({
        order: { id: 'o1' },
        receipt: 'rec-1',
        paidAt: '2026-01-01T00:00:00.000Z',
      }),
    };
    const uc = new VerifyPaymentUseCase({ stripeGateway, paymentRepository });

    const result = await uc.execute({ sessionId: 'cs_1' });

    expect(result.amount).toBe('25.00');
    expect(result.order).toEqual({ id: 'o1' });
    expect(result.receipt).toBe('rec-1');
  });

  it('usa valores por defecto cuando no hay payment', async () => {
    const stripeGateway = {
      retrieveSession: vi.fn().mockResolvedValue({ paymentIntentId: 'pi_1', amountTotal: 0, metadata: { orderId: 'o2' } }),
    };
    const paymentRepository = { findByStripeSessionId: vi.fn().mockResolvedValue(null) };
    const uc = new VerifyPaymentUseCase({ stripeGateway, paymentRepository });

    const result = await uc.execute({ sessionId: 'cs_2' });

    expect(result.order).toEqual({ id: 'o2' });
    expect(result.receipt).toBe('pi_1_cs_2');
    expect(result.amount).toBe('0.00');
  });
});
