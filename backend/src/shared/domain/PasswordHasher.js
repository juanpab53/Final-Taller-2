// Port interface for hashing passwords used across bounded contexts (users, auth).
// Implementations (e.g., shared/infrastructure/BcryptHasher.js) must provide the methods below.

export class PasswordHasher {
  /**
   * Generate a password hash from raw string.
   * @param {string} raw
   * @returns {Promise<string>}
   */
  async hash(raw) {
    throw new Error('PasswordHasher.hash() not implemented.');
  }

  /**
   * Compare raw password against existing hash.
   * @param {string} raw
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  async compare(raw, hash) {
    throw new Error('PasswordHasher.compare() not implemented.');
  }
}
