import { describe, it, expect } from 'vitest';
import { Cart, CartItem } from '../../../src/cart/domain/Cart.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';

describe('Cart', () => {
  it('aplica defaults de state e items', () => {
    const cart = new Cart({ id: 'c1', userId: 'u1' });
    expect(cart.state).toBe('ACTIVE');
    expect(cart.items).toEqual([]);
  });

  it('calcula subtotal y total a partir de los items', () => {
    const cart = new Cart({
      id: 'c1',
      userId: 'u1',
      items: [
        { quantity: 2, unitPrice: 10 },
        { quantity: 3, unitPrice: 5.5 },
      ],
    });
    expect(cart.subtotal).toBe(36.5);
    expect(cart.total).toBe(36.5);
  });

  it('ignora items sin unitPrice en el subtotal', () => {
    const cart = new Cart({ id: 'c1', userId: 'u1', items: [{ quantity: 2 }] });
    expect(cart.subtotal).toBe(0);
  });
});

describe('CartItem', () => {
  it('construye un item válido', () => {
    const item = new CartItem({ id: 'i1', bookId: 'b1', quantity: 2, unitPrice: 10 });
    expect(item.quantity).toBe(2);
    expect(item.unitPrice).toBe(10);
    expect(item.book).toBeNull();
  });

  it.each([0, -1, 1.5, '2'])('lanza error con quantity inválida (%s)', (quantity) => {
    expect(() => new CartItem({ quantity, bookId: 'b1' })).toThrow(ValidationError);
  });

  it.each([-1, '10'])('lanza error con unitPrice inválido (%s)', (unitPrice) => {
    expect(() => new CartItem({ unitPrice, bookId: 'b1' })).toThrow(ValidationError);
  });
});
