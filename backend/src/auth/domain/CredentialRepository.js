export class CredentialRepository {
  async findByUserId(userId) {
    throw new Error('CredentialRepository.findByUserId must be implemented by a concrete adapter');
  }
}
