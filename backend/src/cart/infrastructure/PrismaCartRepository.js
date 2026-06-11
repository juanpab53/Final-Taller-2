import { prisma } from "../../database/prismaClient.js";
import { CartRepository } from "../domain/CartRepository.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";

export class PrismaCartRepository extends CartRepository {
  async findActiveByUserId(userId) {
    const row = await prisma.cart.findFirst({
      where: { user_id: userId, state: 'ACTIVE' },
      include: {
        cartItems: {
          include: {
            book: { include: { author: true } },
          },
        },
      },
    });
    return row ? this._mapToCart(row) : null;
  }

  async findById(id) {
    const row = await prisma.cart.findUnique({
      where: { id },
      include: {
        cartItems: {
          include: {
            book: { include: { author: true } },
          },
        },
      },
    });
    return row ? this._mapToCart(row) : null;
  }

  async save(cart) {
    const created = await prisma.cart.create({
      data: { user_id: cart.userId },
      include: {
        cartItems: {
          include: { book: { include: { author: true } } },
        },
      },
    });
    return this._mapToCart(created);
  }

  async addItem(cartId, bookId, quantity, unitPrice) {
    const existing = await prisma.cartItem.findFirst({
      where: { cart_id: cartId, book_id: bookId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart_id: cartId,
          book_id: bookId,
          quantity,
          unit_price: unitPrice,
        },
      });
    }
  }

  async updateItemQuantity(itemId, quantity) {
    try {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Cart item not found.');
      throw err;
    }
  }

  async removeItem(itemId) {
    try {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } catch (err) {
      if (err?.code === 'P2025') throw new NotFoundError('Cart item not found.');
      throw err;
    }
  }

  async clearCart(cartId) {
    await prisma.cartItem.deleteMany({ where: { cart_id: cartId } });
  }

  async completeCart(cartId) {
    await prisma.cart.update({
      where: { id: cartId },
      data: { state: 'COMPLETED' },
    });
  }

  _mapToCart(row) {
    return {
      id: row.id,
      userId: row.user_id,
      state: row.state,
      items: (row.cartItems || []).map(item => ({
        id: item.id,
        cartId: item.cart_id,
        bookId: item.book_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        book: item.book ? {
          id: item.book.id,
          name: item.book.name,
          price: item.book.price,
          stock: item.book.stock,
          image_url: item.book.image_url,
          author: item.book.author ? { id: item.book.author.id, name: item.book.author.name } : undefined,
        } : undefined,
      })),
      // currently identical — total will differ when discounts/taxes are added
      subtotal: (row.cartItems || []).reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
      total: (row.cartItems || []).reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    };
  }
}
