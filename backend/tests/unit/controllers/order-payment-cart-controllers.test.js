import { describe, it, expect, vi } from 'vitest';
import { CartController } from '../../../src/cart/infrastructure/CartController.js';
import { OrderController } from '../../../src/order/infrastructure/OrderController.js';
import { AdminOrderController } from '../../../src/order/infrastructure/AdminOrderController.js';
import { PaymentController } from '../../../src/payment/infrastructure/PaymentController.js';
import { makeReq, makeRes } from '../../helpers/test-utils.js';

describe('CartController', () => {
  const cart = { id: 'c1', items: [] };

  it('getCart usa el userId del request', async () => {
    const getCartUseCase = { execute: vi.fn().mockResolvedValue(cart) };
    const controller = new CartController({ getCartUseCase, addToCartUseCase: {}, updateCartItemUseCase: {}, removeCartItemUseCase: {} });
    const res = makeRes();

    await controller.getCart(makeReq(), res);

    expect(getCartUseCase.execute).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(res.body).toEqual({ success: true, data: cart });
  });

  it('addItem responde 201 y aplica quantity por defecto', async () => {
    const addToCartUseCase = { execute: vi.fn().mockResolvedValue(cart) };
    const controller = new CartController({ getCartUseCase: {}, addToCartUseCase, updateCartItemUseCase: {}, removeCartItemUseCase: {} });
    const res = makeRes();

    await controller.addItem(makeReq({ body: { bookId: 'b1' } }), res);

    expect(addToCartUseCase.execute).toHaveBeenCalledWith({ userId: 'user-1', bookId: 'b1', quantity: 1 });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('updateItem y removeItem delegan', async () => {
    const updateCartItemUseCase = { execute: vi.fn().mockResolvedValue(cart) };
    const removeCartItemUseCase = { execute: vi.fn().mockResolvedValue(cart) };
    const controller = new CartController({ getCartUseCase: {}, addToCartUseCase: {}, updateCartItemUseCase, removeCartItemUseCase });
    const res = makeRes();

    await controller.updateItem(makeReq({ params: { itemId: 'i1' }, body: { quantity: 3 } }), res);
    expect(updateCartItemUseCase.execute).toHaveBeenCalledWith({ userId: 'user-1', itemId: 'i1', quantity: 3 });

    await controller.removeItem(makeReq({ params: { itemId: 'i1' } }), res);
    expect(removeCartItemUseCase.execute).toHaveBeenCalledWith({ userId: 'user-1', itemId: 'i1' });
  });
});

describe('OrderController', () => {
  it('create responde 201', async () => {
    const createOrderUseCase = { execute: vi.fn().mockResolvedValue({ url: 'https://pay' }) };
    const controller = new OrderController({ createOrderUseCase, getUserOrdersUseCase: {}, getOrderDetailUseCase: {} });
    const res = makeRes();

    await controller.create(makeReq({ body: { shipping: { zip: '1' } } }), res);

    expect(createOrderUseCase.execute).toHaveBeenCalledWith({ userId: 'user-1', shipping: { zip: '1' } });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('listUserOrders y getById envuelven en data', async () => {
    const getUserOrdersUseCase = { execute: vi.fn().mockResolvedValue([{ id: 'o1' }]) };
    const getOrderDetailUseCase = { execute: vi.fn().mockResolvedValue({ id: 'o1' }) };
    const controller = new OrderController({ createOrderUseCase: {}, getUserOrdersUseCase, getOrderDetailUseCase });
    const res = makeRes();

    await controller.listUserOrders(makeReq(), res);
    expect(res.body).toEqual({ success: true, data: { orders: [{ id: 'o1' }] } });

    await controller.getById(makeReq({ params: { id: 'o1' } }), res);
    expect(getOrderDetailUseCase.execute).toHaveBeenCalledWith({ id: 'o1', userId: 'user-1' });
    expect(res.body).toEqual({ success: true, data: { order: { id: 'o1' } } });
  });
});

describe('AdminOrderController', () => {
  it('list usa status por defecto', async () => {
    const listAllOrdersUseCase = { execute: vi.fn().mockResolvedValue({ items: [], total: 0 }) };
    const controller = new AdminOrderController({ listAllOrdersUseCase, updateOrderStatusUseCase: {}, getStatsUseCase: {} });
    const res = makeRes();

    await controller.list(makeReq({ query: {} }), res);

    expect(listAllOrdersUseCase.execute).toHaveBeenCalledWith({ status: 'all', page: undefined, limit: undefined });
    expect(res.body).toEqual({ success: true, data: { items: [], total: 0 } });
  });

  it('updateStatus delega con el id de params', async () => {
    const updateOrderStatusUseCase = { execute: vi.fn().mockResolvedValue({ id: 'o1', state: 'PAID' }) };
    const controller = new AdminOrderController({ listAllOrdersUseCase: {}, updateOrderStatusUseCase, getStatsUseCase: {} });
    const res = makeRes();

    await controller.updateStatus(makeReq({ params: { id: 'o1' }, body: { status: 'PAID' } }), res);

    expect(updateOrderStatusUseCase.execute).toHaveBeenCalledWith({ id: 'o1', status: 'PAID' });
    expect(res.body).toEqual({ success: true, data: { order: { id: 'o1', state: 'PAID' } } });
  });

  it('getStats responde las estadísticas', async () => {
    const getStatsUseCase = { execute: vi.fn().mockResolvedValue({ totalOrders: 3 }) };
    const controller = new AdminOrderController({ listAllOrdersUseCase: {}, updateOrderStatusUseCase: {}, getStatsUseCase });
    const res = makeRes();

    await controller.getStats(makeReq(), res);

    expect(res.body).toEqual({ success: true, data: { totalOrders: 3 } });
  });
});

describe('PaymentController', () => {
  it('handleWebhook responde 400 sin firma', async () => {
    const controller = new PaymentController({ stripeGateway: {}, handleStripeWebhookUseCase: {}, verifyPaymentUseCase: {} });
    const res = makeRes();

    await controller.handleWebhook(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('handleWebhook verifica firma y procesa el evento', async () => {
    const event = { type: 'checkout.session.completed' };
    const stripeGateway = { verifyWebhookSignature: vi.fn().mockReturnValue(event) };
    const handleStripeWebhookUseCase = { execute: vi.fn().mockResolvedValue({ received: true }) };
    const controller = new PaymentController({ stripeGateway, handleStripeWebhookUseCase, verifyPaymentUseCase: {} });
    const res = makeRes();

    await controller.handleWebhook(makeReq({ headers: { 'stripe-signature': 'sig' }, body: Buffer.from('{}') }), res);

    expect(stripeGateway.verifyWebhookSignature).toHaveBeenCalledWith(expect.any(Buffer), 'sig');
    expect(handleStripeWebhookUseCase.execute).toHaveBeenCalledWith({ event });
    expect(res.body).toEqual({ success: true, data: { received: true } });
  });

  it('verify responde 400 sin session_id', async () => {
    const controller = new PaymentController({ stripeGateway: {}, handleStripeWebhookUseCase: {}, verifyPaymentUseCase: {} });
    const res = makeRes();

    await controller.verify(makeReq({ query: {} }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('verify delega con session_id', async () => {
    const verifyPaymentUseCase = { execute: vi.fn().mockResolvedValue({ amount: '10.00' }) };
    const controller = new PaymentController({ stripeGateway: {}, handleStripeWebhookUseCase: {}, verifyPaymentUseCase });
    const res = makeRes();

    await controller.verify(makeReq({ query: { session_id: 'cs_1' } }), res);

    expect(verifyPaymentUseCase.execute).toHaveBeenCalledWith({ sessionId: 'cs_1' });
    expect(res.body).toEqual({ success: true, data: { amount: '10.00' } });
  });
});
