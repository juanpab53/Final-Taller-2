import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class LoginRequestDTO {
  constructor({ email, password }) {
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new ValidationError('Email es requerido.');
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      throw new ValidationError('Password es requerido.');
    }

    this.email = email.trim();
    this.password = password;
  }
}
