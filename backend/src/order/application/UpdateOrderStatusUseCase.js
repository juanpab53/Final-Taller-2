import { ValidationError } from "../../shared/errors/ValidationError.js";
import { NotFoundError } from "../../shared/errors/NotFoundError.js";

const VALID_TRANSITIONS = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export class UpdateOrderStatusUseCase {
  constructor({ orderRepository }) {
    this.orderRepository = orderRepository;
  }

  async execute({ id, status }) {
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const newStatus = status.toUpperCase();

    if (!validStatuses.includes(newStatus)) {
      throw new ValidationError(`Invalid status: ${status}. Valid values: ${validStatuses.join(', ')}`);
    }

    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundError('Order not found.');

    const allowed = VALID_TRANSITIONS[order.state] || [];
    if (!allowed.includes(newStatus)) {
      throw new ValidationError(`Cannot transition from ${order.state} to ${newStatus}.`);
    }

    return this.orderRepository.updateStatus(id, newStatus);
  }
}
