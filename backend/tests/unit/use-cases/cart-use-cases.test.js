import { describe, it, expect, vi } from 'vitest';
import { GetCartUseCase } from '../../../src/cart/application/GetCartUseCase.js';
import { AddToCartUseCase } from '../../../src/cart/application/AddToCartUseCase.js';
import { UpdateCartItemUseCase } from '../../../src/cart/application/UpdateCartItemUseCase.js';
import { RemoveCartItemUseCase } from '../../../src/cart/application/RemoveCartItemUseCase.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';

describe('GetCartUseCase', () => {
  it('devuelve el carrito activo si existe', async () => {
    const cart = { id: 'c1', items: [] };
    const cartRepository = { findActiveByUserId: vi.fn().mockResolvedValue(cart), save: vi.fn() };
    const uc = new GetCartUseCase({ cartRepository });
    await expect(uc.execute({ userId: 'u1' })).resolves.toBe(cart);
    expect(cartRepository.save).not.toHaveBeenCalled();
  });

  it('crea y guarda un carrito activo si no existe', async () => {
    const cartRepository = {
      findActiveByUserId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({ id: 'c1', state: 'ACTIVE' }),
    };
    const uc = new GetCartUseCase({ cartRepository });
    const result = await uc.execute({ userId: 'u1' });
    expect(cartRepository.save).toHaveBeenCalledWith({ userId: 'u1', state: 'ACTIVE' });
    expect(result.state).toBe('ACTIVE');
  });
});

describe('AddToCartUseCase', () => {
  it('lanza ValidationError sin bookId', async () => {
    const uc = new AddToCartUseCase({ cartRepository: {}, bookRepository: {} });
    await expect(uc.execute({ userId: 'u1' })).rejects.toThrow(ValidationError);
  });

  it.each([0, -1, 1.5, '2', undefined])('lanza ValidationError con quantity inválida (%s)', async (quantity) => {
    const uc = new AddToCartUseCase({ cartRepository: {}, bookRepository: {} });
    await expect(uc.execute({ userId: 'u1', bookId: 'b1', quantity })).rejects.toThrow(ValidationError);
  });

  it('lanza ValidationError si el libro no existe', async () => {
    const bookRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new AddToCartUseCase({ cartRepository: {}, bookRepository });
    await expect(uc.execute({ userId: 'u1', bookId: 'b1', quantity: 1 })).rejects.toThrow(ValidationError);
  });

  it('crea carrito si no hay activo y añade el item con el precio del libro', async () => {
    const cartRepository = {
      findActiveByUserId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({ id: 'c1' }),
      addItem: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue({ id: 'c1', items: [{ bookId: 'b1', quantity: 2 }] }),
    };
    const bookRepository = { findById: vi.fn().mockResolvedValue({ id: 'b1', price: 25 }) };
    const uc = new AddToCartUseCase({ cartRepository, bookRepository });

    const result = await uc.execute({ userId: 'u1', bookId: 'b1', quantity: 2 });

    expect(cartRepository.save).toHaveBeenCalledWith({ userId: 'u1', state: 'ACTIVE' });
    expect(cartRepository.addItem).toHaveBeenCalledWith('c1', 'b1', 2, 25);
    expect(result.items[0].bookId).toBe('b1');
  });

  it('reutiliza el carrito activo existente', async () => {
    const cartRepository = {
      findActiveByUserId: vi.fn().mockResolvedValue({ id: 'c1' }),
      save: vi.fn(),
      addItem: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue({ id: 'c1' }),
    };
    const bookRepository = { findById: vi.fn().mockResolvedValue({ id: 'b1', price: 10 }) };
    const uc = new AddToCartUseCase({ cartRepository, bookRepository });

    await uc.execute({ userId: 'u1', bookId: 'b1', quantity: 1 });

    expect(cartRepository.save).not.toHaveBeenCalled();
    expect(cartRepository.addItem).toHaveBeenCalledWith('c1', 'b1', 1, 10);
  });
});

describe('UpdateCartItemUseCase', () => {
  it.each([null, -1, 1.5, '2'])('lanza ValidationError con quantity inválida (%s)', async (quantity) => {
    const uc = new UpdateCartItemUseCase({ cartRepository: {} });
    await expect(uc.execute({ userId: 'u1', itemId: 'i1', quantity })).rejects.toThrow(ValidationError);
  });

  it('elimina el item si quantity es 0', async () => {
    const cartRepository = {
      removeItem: vi.fn().mockResolvedValue(undefined),
      updateItemQuantity: vi.fn(),
      findActiveByUserId: vi.fn().mockResolvedValue({ id: 'c1' }),
    };
    const uc = new UpdateCartItemUseCase({ cartRepository });
    await uc.execute({ userId: 'u1', itemId: 'i1', quantity: 0 });
    expect(cartRepository.removeItem).toHaveBeenCalledWith('i1');
    expect(cartRepository.updateItemQuantity).not.toHaveBeenCalled();
  });

  it('actualiza la cantidad cuando es mayor a 0', async () => {
    const cartRepository = {
      removeItem: vi.fn(),
      updateItemQuantity: vi.fn().mockResolvedValue(undefined),
      findActiveByUserId: vi.fn().mockResolvedValue({ id: 'c1' }),
    };
    const uc = new UpdateCartItemUseCase({ cartRepository });
    await uc.execute({ userId: 'u1', itemId: 'i1', quantity: 3 });
    expect(cartRepository.updateItemQuantity).toHaveBeenCalledWith('i1', 3);
  });
});

describe('RemoveCartItemUseCase', () => {
  it('elimina el item y devuelve el carrito', async () => {
    const cartRepository = {
      removeItem: vi.fn().mockResolvedValue(undefined),
      findActiveByUserId: vi.fn().mockResolvedValue({ id: 'c1' }),
    };
    const uc = new RemoveCartItemUseCase({ cartRepository });
    const result = await uc.execute({ userId: 'u1', itemId: 'i1' });
    expect(cartRepository.removeItem).toHaveBeenCalledWith('i1');
    expect(result.id).toBe('c1');
  });
});
