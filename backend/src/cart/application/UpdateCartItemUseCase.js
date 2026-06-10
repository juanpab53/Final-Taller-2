import { ValidationError } from "../../shared/errors/ValidationError.js";

export class UpdateCartItemUseCase {
  constructor({ cartRepository }) {
    this.cartRepository = cartRepository;
  }

  async execute({ userId, itemId, quantity }) {
    if (quantity == null || !Number.isInteger(quantity) || quantity < 0) {
      throw new ValidationError('Quantity must be a non-negative integer.');
    }

    if (quantity === 0) {
      await this.cartRepository.removeItem(itemId);
    } else {
      await this.cartRepository.updateItemQuantity(itemId, quantity);
    }

    const cart = await this.cartRepository.findActiveByUserId(userId);
    return cart;
  }
}
