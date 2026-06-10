export class ListAllOrdersUseCase {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ status }) {
    const orders = await this.orderRepository.findAll({ status });
    return { orders };
  }
}
