export class RemoveCartItemUseCase {
  constructor({ cartRepository }) {
    this.cartRepository = cartRepository;
  }

  async execute({ userId, itemId }) {
    await this.cartRepository.removeItem(itemId);
    const cart = await this.cartRepository.findActiveByUserId(userId);
    return cart;
  }
}
