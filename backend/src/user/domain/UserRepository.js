export class UserRepository {
  async save(userData) {
    throw new Error('UserRepository.save must be implemented by a concrete adapter');
  }

  async findById(id) {
    throw new Error('UserRepository.findById must be implemented by a concrete adapter');
  }

  async findByEmail(email) {
    throw new Error('UserRepository.findByEmail must be implemented by a concrete adapter');
  }
}
