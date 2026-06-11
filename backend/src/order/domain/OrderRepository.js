export class OrderRepository {
  async save(order) { throw new Error('OrderRepository.save not implemented.'); }
  async findById(id) { throw new Error('OrderRepository.findById not implemented.'); }
  async findByUserId(userId) { throw new Error('OrderRepository.findByUserId not implemented.'); }
  async findAll(filters) { throw new Error('OrderRepository.findAll not implemented.'); }
  async updateStatus(id, state) { throw new Error('OrderRepository.updateStatus not implemented.'); }
  async findStats() { throw new Error('OrderRepository.findStats not implemented.'); }
}
