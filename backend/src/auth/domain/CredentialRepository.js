export class CredentialRepository {
  async findByUserId(userId) {
    throw new Error('CredentialRepository.findByUserId must be implemented by a concrete adapter');
  }

  async findByEmailWithCredentials(email) {
    throw new Error('CredentialRepository.findByEmailWithCredentials must be implemented by a concrete adapter');
  }
}
