import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class UpdateCategoryDTO {
  constructor({ name }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('Category name is required.');
    }
    this.name = name.trim();
  }
}
