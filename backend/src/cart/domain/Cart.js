import { ValidationError } from "../../shared/errors/ValidationError.js";

export class Cart {
  constructor({ id, userId, state, items }) {
    this.id = id;
    this.userId = userId;
    this.state = state || 'ACTIVE';
    this.items = items || [];
  }

  get subtotal() {
    return this.items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
  }

  get total() {
    return this.subtotal;
  }
}

export class CartItem {
  constructor({ id, cartId, bookId, quantity, unitPrice, book }) {
    if (quantity != null && (!Number.isInteger(quantity) || quantity < 1)) {
      throw new ValidationError('Quantity must be a positive integer.');
    }
    if (unitPrice != null && (typeof unitPrice !== 'number' || unitPrice < 0)) {
      throw new ValidationError('Unit price must be a non-negative number.');
    }

    this.id = id;
    this.cartId = cartId;
    this.bookId = bookId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.book = book || null;
  }
}
