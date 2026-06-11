export class CartController {
  constructor({ getCartUseCase, addToCartUseCase, updateCartItemUseCase, removeCartItemUseCase }) {
    this.getCartUseCase = getCartUseCase;
    this.addToCartUseCase = addToCartUseCase;
    this.updateCartItemUseCase = updateCartItemUseCase;
    this.removeCartItemUseCase = removeCartItemUseCase;
  }

  async getCart(req, res) {
    const cart = await this.getCartUseCase.execute({ userId: req.user.id });
    res.json({ success: true, data: cart });
  }

  async addItem(req, res) {
    const { bookId, quantity } = req.body;
    const cart = await this.addToCartUseCase.execute({ userId: req.user.id, bookId, quantity: quantity || 1 });
    res.status(201).json({ success: true, data: cart });
  }

  async updateItem(req, res) {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await this.updateCartItemUseCase.execute({ userId: req.user.id, itemId, quantity });
    res.json({ success: true, data: cart });
  }

  async removeItem(req, res) {
    const { itemId } = req.params;
    const cart = await this.removeCartItemUseCase.execute({ userId: req.user.id, itemId });
    res.json({ success: true, data: cart });
  }
}
