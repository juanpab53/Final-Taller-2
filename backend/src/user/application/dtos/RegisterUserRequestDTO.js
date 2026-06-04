import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class RegisterUserRequestDTO {
  constructor({ email, password, name, tel }) {
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new ValidationError('Email is required.');
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters.');
    }

    if (name && typeof name !== 'string') {
      throw new ValidationError('Invalid name.');
    }

    if (tel && typeof tel !== 'string') {
      throw new ValidationError('Invalid phone number.');
    }

    this.email = email.trim();
    this.password = password;
    this.name = name ? name.trim() : "";
    this.tel = tel ? tel.trim() : "";
  }
}
