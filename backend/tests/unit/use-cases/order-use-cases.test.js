import { describe, it, expect, vi } from 'vitest';
import { CreateOrderUseCase } from '../../../src/order/application/CreateOrderUseCase.js';
import { GetUserOrdersUseCase } from '../../../src/order/application/GetUserOrdersUseCase.js';
import { GetOrderDetailUseCase } from '../../../src/order/application/GetOrderDetailUseCase.js';
import { ListAllOrdersUseCase } from '../../../src/order/application/ListAllOrdersUseCase.js';
import { UpdateOrderStatusUseCase } from '../../../src/order/application/UpdateOrderStatusUseCase.js';
import { GetStatsUseCase } from '../../../src/order/application/GetStatsUseCase.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';
import { NotFoundError } from '../../../src/shared/errors/NotFoundError.js';
import { ForbiddenError } from '../../../src/shared/errors/ForbiddenError.js';
import { AppError } from '../../../src/shared/errors/AppError.js';

const shipping = { first: 'A', last: 'B', address: 'C', city: 'D', state: 'E', zip: '123' };

function makeOrderDeps(overrides = {}) {
  return {
    cartRepository: {
      findActiveByUserId: vi.fn().mockResolvedValue({ id: 'c1', items: [{ bookId: 'b1', quantity: 2, unitPrice: 10 }] }),
      completeCart: vi.fn().mockResolvedValue(undefined),
    },
    bookRepository: {
      findById: vi.fn().mockResolvedValue({ id: 'b1', name: 'Libro', stock: 10 }),
      updateStock: vi.fn().mockResolvedValue(undefined),
    },
    orderRepository: {
      save: vi.fn().mockResolvedValue({ id: 'o1', total: 20 }),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    },
    paymentRepository: { save: vi.fn().mockResolvedValue(undefined) },
    stripeGateway: {
      createCheckoutSession: vi.fn().mockResolvedValue({ id: 'cs_1', url: 'https://checkout' }),
    },
    ...overrides,
  };
}

describe('CreateOrderUseCase', () => {
  it('lanza ValidationError si falta shipping', async () => {
    const uc = new CreateOrderUseCase(makeOrderDeps());
    await expect(uc.execute({ userId: 'u1', shipping: null })).rejects.toThrow(ValidationError);
  });

  it('lanza ValidationError con carrito vacío', async () => {
    const deps = makeOrderDeps({ cartRepository: { findActiveByUserId: vi.fn().mockResolvedValue({ id: 'c1', items: [] }), completeCart: vi.fn() } });
    const uc = new CreateOrderUseCase(deps);
    await expect(uc.execute({ userId: 'u1', shipping })).rejects.toThrow(ValidationError);
  });

  it('lanza ValidationError si un libro no existe', async () => {
    const deps = makeOrderDeps({ bookRepository: { findById: vi.fn().mockResolvedValue(null) } });
    const uc = new CreateOrderUseCase(deps);
    await expect(uc.execute({ userId: 'u1', shipping })).rejects.toThrow(ValidationError);
  });

  it('lanza ValidationError con stock insuficiente', async () => {
    const deps = makeOrderDeps({ bookRepository: { findById: vi.fn().mockResolvedValue({ id: 'b1', name: 'Libro', stock: 1 }) } });
    const uc = new CreateOrderUseCase(deps);
    await expect(uc.execute({ userId: 'u1', shipping })).rejects.toThrow(ValidationError);
  });

  it('crea la orden, la sesión Stripe, el pago y completa el carrito', async () => {
    const deps = makeOrderDeps();
    const uc = new CreateOrderUseCase(deps);

    const result = await uc.execute({ userId: 'u1', shipping });

    expect(deps.bookRepository.updateStock).toHaveBeenCalledWith('b1', -2);
    expect(deps.orderRepository.save).toHaveBeenCalledWith({
      userId: 'u1',
      total: 20,
      direction: JSON.stringify(shipping),
      state: 'PENDING',
      items: [{ bookId: 'b1', quantity: 2, unitPrice: 10 }],
    });
    expect(deps.stripeGateway.createCheckoutSession).toHaveBeenCalledOnce();
    expect(deps.paymentRepository.save).toHaveBeenCalledOnce();
    expect(deps.cartRepository.completeCart).toHaveBeenCalledWith('c1');
    expect(result).toEqual({ url: 'https://checkout' });
  });

  it('cancela la orden con AppError 502 si Stripe falla', async () => {
    const deps = makeOrderDeps({ stripeGateway: { createCheckoutSession: vi.fn().mockRejectedValue(new Error('stripe down')) } });
    const uc = new CreateOrderUseCase(deps);

    await expect(uc.execute({ userId: 'u1', shipping })).rejects.toThrow(AppError);
    expect(deps.orderRepository.updateStatus).toHaveBeenCalledWith('o1', 'CANCELLED');
  });

  it('cancela la orden con AppError 500 si no se puede guardar el pago', async () => {
    const deps = makeOrderDeps({ paymentRepository: { save: vi.fn().mockRejectedValue(new Error('db')) } });
    const uc = new CreateOrderUseCase(deps);

    await expect(uc.execute({ userId: 'u1', shipping })).rejects.toThrow(AppError);
    expect(deps.orderRepository.updateStatus).toHaveBeenCalledWith('o1', 'CANCELLED');
  });
});

describe('GetUserOrdersUseCase', () => {
  it('devuelve las órdenes del usuario', async () => {
    const orderRepository = { findByUserId: vi.fn().mockResolvedValue([{ id: 'o1' }]) };
    const uc = new GetUserOrdersUseCase({ orderRepository });
    await expect(uc.execute({ userId: 'u1' })).resolves.toEqual([{ id: 'o1' }]);
    expect(orderRepository.findByUserId).toHaveBeenCalledWith('u1');
  });
});

describe('GetOrderDetailUseCase', () => {
  it('lanza ForbiddenError si la orden no pertenece al usuario', async () => {
    const orderRepository = { findById: vi.fn().mockResolvedValue({ id: 'o1', userId: 'otro' }) };
    const uc = new GetOrderDetailUseCase({ orderRepository });
    await expect(uc.execute({ id: 'o1', userId: 'u1' })).rejects.toThrow(ForbiddenError);
  });

  it('devuelve la orden si pertenece al usuario', async () => {
    const orderRepository = { findById: vi.fn().mockResolvedValue({ id: 'o1', userId: 'u1' }) };
    const uc = new GetOrderDetailUseCase({ orderRepository });
    await expect(uc.execute({ id: 'o1', userId: 'u1' })).resolves.toEqual({ id: 'o1', userId: 'u1' });
  });
});

describe('ListAllOrdersUseCase', () => {
  it('pasa filtros con defaults', async () => {
    const orderRepository = { findAll: vi.fn().mockResolvedValue({ items: [], total: 0 }) };
    const uc = new ListAllOrdersUseCase({ orderRepository });
    await uc.execute({});
    expect(orderRepository.findAll).toHaveBeenCalledWith({ status: undefined }, 1, 15);
  });

  it('pasa filtros explícitos', async () => {
    const orderRepository = { findAll: vi.fn().mockResolvedValue({ items: [], total: 0 }) };
    const uc = new ListAllOrdersUseCase({ orderRepository });
    await uc.execute({ status: 'PAID', page: '2', limit: '5' });
    expect(orderRepository.findAll).toHaveBeenCalledWith({ status: 'PAID' }, 2, 5);
  });
});

describe('UpdateOrderStatusUseCase', () => {
  const orderRepository = {
    findById: vi.fn(),
    updateStatus: vi.fn().mockResolvedValue(undefined),
  };

  it('lanza ValidationError con estado inválido', async () => {
    const uc = new UpdateOrderStatusUseCase({ orderRepository });
    await expect(uc.execute({ id: 'o1', status: 'DESPACHADO' })).rejects.toThrow(ValidationError);
  });

  it('lanza NotFoundError si la orden no existe', async () => {
    orderRepository.findById.mockResolvedValue(null);
    const uc = new UpdateOrderStatusUseCase({ orderRepository });
    await expect(uc.execute({ id: 'o1', status: 'PAID' })).rejects.toThrow(NotFoundError);
  });

  it('lanza ValidationError con transición no permitida', async () => {
    orderRepository.findById.mockResolvedValue({ id: 'o1', state: 'DELIVERED' });
    const uc = new UpdateOrderStatusUseCase({ orderRepository });
    await expect(uc.execute({ id: 'o1', status: 'PAID' })).rejects.toThrow(ValidationError);
  });

  it('actualiza el estado en transiciones válidas', async () => {
    orderRepository.findById.mockResolvedValue({ id: 'o1', state: 'PENDING' });
    const uc = new UpdateOrderStatusUseCase({ orderRepository });
    await uc.execute({ id: 'o1', status: 'paid' });
    expect(orderRepository.updateStatus).toHaveBeenCalledWith('o1', 'PAID');
  });
});

describe('GetStatsUseCase', () => {
  it('combina estadísticas de ordenes y low stock', async () => {
    const orderRepository = { findStats: vi.fn().mockResolvedValue({ totalOrders: 5, revenue: 100 }) };
    const bookRepository = { countLowStock: vi.fn().mockResolvedValue(2) };
    const uc = new GetStatsUseCase({ orderRepository, bookRepository });
    await expect(uc.execute()).resolves.toEqual({ totalOrders: 5, revenue: 100, lowStockCount: 2 });
  });
});
