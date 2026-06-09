export class PasswordHasher {
  async hash(raw) {
    throw new Error('PasswordHasher.hash() not implemented.');
  }

  async compare(raw, hash) {
    throw new Error('PasswordHasher.compare() not implemented.');
  }
}
