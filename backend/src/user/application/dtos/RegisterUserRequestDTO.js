import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class RegisterUserRequestDTO {
  constructor({ email, password, name, tel }) {
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new ValidationError('Email es requerido.');
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new ValidationError('Password requiere al menos 8 caracteres.');
    }

    if (name && typeof name !== 'string') {
      throw new ValidationError('Nombre inválido.');
    }

    if (tel && typeof tel !== 'string') {
      throw new ValidationError('Teléfono inválido.');
    }

    this.email = email.trim();
    this.password = password;
    this.name = name ? name.trim() : "";
    this.tel = tel ? tel.trim() : "";
  }
}
