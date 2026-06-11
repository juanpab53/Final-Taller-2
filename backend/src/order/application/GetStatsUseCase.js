export class GetStatsUseCase {
  constructor({ orderRepository, bookRepository }) {
    this.orderRepository = orderRepository;
    this.bookRepository = bookRepository;
  }

  async execute() {
    const [orderStats, lowStockCount] = await Promise.all([
      this.orderRepository.findStats(),
      this.bookRepository.countLowStock(),
    ]);

    return { ...orderStats, lowStockCount };
  }
}
