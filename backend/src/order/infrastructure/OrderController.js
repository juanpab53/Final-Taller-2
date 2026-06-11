export class OrderController {
  constructor({ createOrderUseCase, getUserOrdersUseCase, getOrderDetailUseCase }) {
    this.createOrderUseCase = createOrderUseCase;
    this.getUserOrdersUseCase = getUserOrdersUseCase;
    this.getOrderDetailUseCase = getOrderDetailUseCase;
  }

  async create(req, res) {
    const { shipping } = req.body;
    const result = await this.createOrderUseCase.execute({ userId: req.user.id, shipping });
    res.status(201).json({ success: true, data: result });
  }

  async listUserOrders(req, res) {
    const orders = await this.getUserOrdersUseCase.execute({ userId: req.user.id });
    res.json({ success: true, data: { orders } });
  }

  async getById(req, res) {
    const { id } = req.params;
    const order = await this.getOrderDetailUseCase.execute({ id, userId: req.user.id });
    res.json({ success: true, data: { order } });
  }
}
