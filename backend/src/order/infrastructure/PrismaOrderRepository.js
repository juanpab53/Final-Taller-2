import { prisma } from "../../database/prismaClient.js";
import { OrderRepository } from "../domain/OrderRepository.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export class PrismaOrderRepository extends OrderRepository {
  async save(order) {
    const created = await prisma.order.create({
      data: {
        user_id: order.userId,
        total: order.total,
        direction: order.direction,
        state: order.state || 'PENDING',
        order_details: {
          create: order.items.map(item => ({
            book_id: item.bookId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
          })),
        },
      },
      include: {
        order_details: { include: { book: true } },
        pay: true,
        user: true,
      },
    });
    return this._mapToOrder(created);
  }

  async findById(id) {
    const row = await prisma.order.findUnique({
      where: { id },
      include: {
        order_details: { include: { book: true } },
        pay: true,
        user: true,
      },
    });
    if (!row) throw new NotFoundError('Order not found.');
    return this._mapToOrder(row);
  }

  async findByUserId(userId) {
    const rows = await prisma.order.findMany({
      where: { user_id: userId },
      include: {
        order_details: { include: { book: true } },
        pay: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return rows.map(r => this._mapToOrder(r));
  }

  async findAll(filters) {
    const where = {};
    if (filters.status && filters.status !== 'all') {
      where.state = filters.status.toUpperCase();
    }

    const rows = await prisma.order.findMany({
      where,
      include: {
        order_details: true,
        user: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      state: r.state,
      total: Number(r.total),
      direction: r.direction,
      customer: r.user ? { name: r.user.name, email: r.user.email } : null,
      items: r.order_details.length,
      createdAt: r.created_at,
    }));
  }

  async updateStatus(id, state) {
    try {
      const updated = await prisma.order.update({
        where: { id },
        data: { state },
        include: {
          order_details: { include: { book: true } },
          pay: true,
        },
      });
      return this._mapToOrder(updated);
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Order not found.');
      throw err;
    }
  }

  async findStats() {
    const [total, cancelled, dailyAgg, monthlyAgg] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { state: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: { state: 'PAID', created_at: { gte: startOfDay() } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { state: 'PAID', created_at: { gte: startOfMonth() } },
        _sum: { total: true },
      }),
    ]);

    return {
      cancellationRate: total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0,
      dailyRevenue: Number(dailyAgg._sum.total || 0),
      monthlyRevenue: Number(monthlyAgg._sum.total || 0),
    };
  }

  _mapToOrder(row) {
    return {
      id: row.id,
      userId: row.user_id,
      state: row.state,
      total: Number(row.total),
      direction: row.direction,
      createdAt: row.created_at,
      items: (row.order_details || []).map(d => ({
        id: d.id,
        bookId: d.book_id,
        quantity: d.quantity,
        unitPrice: d.unit_price,
        bookName: d.book?.name,
      })),
      payment: row.pay ? {
        id: row.pay.id,
        status: row.pay.status,
        receipt: row.pay.receipt,
        amount: Number(row.pay.amount),
        stripeCheckoutSessionId: row.pay.stripe_checkout_session_id,
      } : null,
    };
  }
}
