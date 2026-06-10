export class Order {
  constructor({ id, userId, state, total, direction, createdAt, items }) {
    this.id = id;
    this.userId = userId;
    this.state = state || 'PENDING';
    this.total = total;
    this.direction = direction;
    this.createdAt = createdAt;
    this.items = items || [];
  }
}
