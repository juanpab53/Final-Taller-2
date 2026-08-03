import { describe, it, expect } from 'vitest';
import { Order } from '../../../src/order/domain/Order.js';
import { OrderItem } from '../../../src/order/domain/OrderItem.js';
import { Payment } from '../../../src/payment/domain/Payment.js';
import { Credential } from '../../../src/auth/domain/Credential.js';

describe('Order', () => {
  it('aplica defaults de state e items', () => {
    const order = new Order({ id: 'o1', userId: 'u1', total: 50 });
    expect(order.state).toBe('PENDING');
    expect(order.items).toEqual([]);
  });

  it('preserva los campos provistos', () => {
    const order = new Order({ id: 'o1', userId: 'u1', total: 50, state: 'PAID', direction: '{"zip":"00000"}' });
    expect(order.state).toBe('PAID');
    expect(order.direction).toBe('{"zip":"00000"}');
  });
});

describe('OrderItem', () => {
  it('construye el item de orden', () => {
    const item = new OrderItem({ id: 'oi1', orderId: 'o1', bookId: 'b1', quantity: 2, unitPrice: 9, bookName: 'X' });
    expect(item).toMatchObject({ orderId: 'o1', bookId: 'b1', quantity: 2, unitPrice: 9, bookName: 'X' });
  });
});

describe('Payment', () => {
  it('aplica defaults de status y currency', () => {
    const payment = new Payment({ id: 'p1', orderId: 'o1', amount: 100 });
    expect(payment.status).toBe('PENDING');
    expect(payment.currency).toBe('usd');
  });
});

describe('Credential', () => {
  it('expone el hash del password', () => {
    const cred = new Credential({ userId: 'u1', passwordHash: 'hash-123' });
    expect(cred.getPasswordHash()).toBe('hash-123');
  });
});
