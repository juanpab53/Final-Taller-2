export class AdminOrderController {
  constructor({ listAllOrdersUseCase, updateOrderStatusUseCase, getStatsUseCase }) {
    this.listAllOrdersUseCase = listAllOrdersUseCase;
    this.updateOrderStatusUseCase = updateOrderStatusUseCase;
    this.getStatsUseCase = getStatsUseCase;
  }

  async list(req, res) {
    const { status, page, limit } = req.query;
    const result = await this.listAllOrdersUseCase.execute({ status: status || 'all', page, limit });
    res.json({ success: true, data: result });
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const order = await this.updateOrderStatusUseCase.execute({ id, status });
    res.json({ success: true, data: { order } });
  }

  async getStats(req, res) {
    const data = await this.getStatsUseCase.execute();
    res.json({ success: true, data });
  }
}
