export class GetCartUseCase {
  constructor({ cartRepository }) {
    this.cartRepository = cartRepository;
  }

  async execute({ userId }) {
    let cart = await this.cartRepository.findActiveByUserId(userId);

    if (!cart) {
      cart = await this.cartRepository.save({ userId, state: 'ACTIVE' });
    }

    return cart;
  }
}
