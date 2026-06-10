import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class UpdateAuthorDTO {
  constructor(data = {}) {
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || !data.name.trim()) {
        throw new ValidationError('Author name must be a non-empty string.');
      }
      this.name = data.name.trim();
    }
  }
}
