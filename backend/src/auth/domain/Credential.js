export class Credential {
  constructor({ userId, passwordHash }) {
    this.userId = userId;
    this.passwordHash = passwordHash;
  }

  getPasswordHash() {
    return this.passwordHash;
  }
}
