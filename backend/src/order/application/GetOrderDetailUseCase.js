import { ForbiddenError } from "../../shared/errors/ForbiddenError.js";

export class GetOrderDetailUseCase {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ id, userId }) {
    const order = await this.orderRepository.findById(id);
    if (order.userId !== userId) {
      throw new ForbiddenError('You do not have access to this order.');
    }
    return order;
  }
}
