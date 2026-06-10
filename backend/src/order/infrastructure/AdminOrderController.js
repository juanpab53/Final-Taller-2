export class AdminOrderController {
  constructor({ listAllOrdersUseCase, updateOrderStatusUseCase }) {
    this.listAllOrdersUseCase = listAllOrdersUseCase;
    this.updateOrderStatusUseCase = updateOrderStatusUseCase;
  }

  async list(req, res) {
    const { status } = req.query;
    const result = await this.listAllOrdersUseCase.execute({ status: status || 'all' });
    res.json({ success: true, data: result });
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const order = await this.updateOrderStatusUseCase.execute({ id, status });
    res.json({ success: true, data: { order } });
  }
}
