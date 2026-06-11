export class ListAllOrdersUseCase {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ status, page = 1, limit = 15 }) {
    return this.orderRepository.findAll({ status }, Number(page), Number(limit));
  }
}
