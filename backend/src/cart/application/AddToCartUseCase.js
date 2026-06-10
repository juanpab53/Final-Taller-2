import { ValidationError } from "../../shared/errors/ValidationError.js";

export class AddToCartUseCase {
  constructor({ cartRepository, bookRepository }) {
    this.cartRepository = cartRepository;
    this.bookRepository = bookRepository;
  }

  async execute({ userId, bookId, quantity }) {
    if (!bookId) throw new ValidationError('Book ID is required.');
    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      throw new ValidationError('Quantity must be a positive integer.');
    }

    const book = await this.bookRepository.findById(bookId);
    if (!book) throw new ValidationError('Book not found.');

    let cart = await this.cartRepository.findActiveByUserId(userId);
    if (!cart) {
      cart = await this.cartRepository.save({ userId, state: 'ACTIVE' });
    }

    await this.cartRepository.addItem(cart.id, bookId, quantity, book.price);

    const updatedCart = await this.cartRepository.findById(cart.id);
    return updatedCart;
  }
}
