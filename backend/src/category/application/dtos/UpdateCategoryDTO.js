import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class UpdateCategoryDTO {
  constructor(data = {}) {
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || !data.name.trim()) {
        throw new ValidationError('Category name must be a non-empty string.');
      }
      this.name = data.name.trim();
    }
  }
}
