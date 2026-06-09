import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class CreateAuthorDTO {
  constructor({ name }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('Author name is required.');
    }
    this.name = name.trim();
  }
}
