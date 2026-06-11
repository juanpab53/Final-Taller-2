export class CartRepository {
  async findActiveByUserId(userId) { throw new Error('CartRepository.findActiveByUserId not implemented.'); }
  async findById(id) { throw new Error('CartRepository.findById not implemented.'); }
  async save(cart) { throw new Error('CartRepository.save not implemented.'); }
  async addItem(cartId, bookId, quantity, unitPrice) { throw new Error('CartRepository.addItem not implemented.'); }
  async updateItemQuantity(itemId, quantity) { throw new Error('CartRepository.updateItemQuantity not implemented.'); }
  async removeItem(itemId) { throw new Error('CartRepository.removeItem not implemented.'); }
  async clearCart(cartId) { throw new Error('CartRepository.clearCart not implemented.'); }
  async completeCart(cartId) { throw new Error('CartRepository.completeCart not implemented.'); }
}
