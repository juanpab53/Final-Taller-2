import { ValidationError } from "../../shared/errors/ValidationError.js";

export class Author {
  constructor({ id, name }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('Author name is required.');
    }
    this.id = id;
    this.name = name.trim();
  }

  static create({ name }) {
    return new Author({ name });
  }
}
