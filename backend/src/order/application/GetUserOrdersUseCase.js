export class GetUserOrdersUseCase {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ userId }) {
    return this.orderRepository.findByUserId(userId);
  }
}
