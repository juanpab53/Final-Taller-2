import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class UpdateBookDTO {
  constructor({ name, price, stock, imageUrl, publicationDate, description, language, authorId, categoryId }) {
    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      throw new ValidationError('Book name cannot be empty.');
    }
    if (price !== undefined && (typeof price !== 'number' || !Number.isFinite(price) || price < 0)) {
      throw new ValidationError('Price must be a non-negative number.');
    }
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      throw new ValidationError('Stock must be a non-negative integer.');
    }

    if (name !== undefined) this.name = name.trim();
    if (price !== undefined) this.price = price;
    if (stock !== undefined) this.stock = stock;
    if (imageUrl !== undefined) this.imageUrl = imageUrl;
    if (publicationDate !== undefined) this.publicationDate = new Date(publicationDate);
    if (description !== undefined) this.description = description;
    if (language !== undefined) this.language = language;
    if (authorId !== undefined) this.authorId = authorId;
    if (categoryId !== undefined) this.categoryId = categoryId;
  }
}
