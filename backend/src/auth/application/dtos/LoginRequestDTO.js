import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class LoginRequestDTO {
  constructor({ email, password }) {
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new ValidationError('Email is required.');
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      throw new ValidationError('Password is required.');
    }

    this.email = email.trim();
    this.password = password;
  }
}
