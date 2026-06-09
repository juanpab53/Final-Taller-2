import { ValidationError } from "../../shared/errors/ValidationError.js";

export class Category {
  constructor({ id, name }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('Category name is required.');
    }
    this.id = id;
    this.name = name.trim();
  }

  static create({ name }) {
    return new Category({ name });
  }
}
