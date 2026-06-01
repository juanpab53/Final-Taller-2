import { ValidationError } from "../../shared/errors/ValidationError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  constructor(value) {
    if (!value || typeof value !== "string" || !EMAIL_PATTERN.test(value.trim())) {
      throw new ValidationError("Email inválido.");
    }

    this.value = value.trim().toLowerCase();
  }

  toString() {
    return this.value;
  }
}
