export class OrderItem {
  constructor({ id, orderId, bookId, quantity, unitPrice, bookName }) {
    this.id = id;
    this.orderId = orderId;
    this.bookId = bookId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.bookName = bookName;
  }
}
