import { ValidationError } from "../../shared/errors/ValidationError.js";

export class Book {
  constructor({ id, name, price, stock, imageUrl, publicationDate, description, language, authorId, categoryId }) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new ValidationError('Book name is required.');
    }
    if (price == null || typeof price !== 'number' || price < 0) {
      throw new ValidationError('Price must be a non-negative number.');
    }
    if (stock == null || !Number.isInteger(stock) || stock < 0) {
      throw new ValidationError('Stock must be a non-negative integer.');
    }
    if (!authorId) throw new ValidationError('Author is required.');
    if (!categoryId) throw new ValidationError('Category is required.');

    this.id = id;
    this.name = name.trim();
    this.price = price;
    this.stock = stock;
    this.imageUrl = imageUrl || null;
    this.publicationDate = publicationDate;
    this.description = description || null;
    this.language = language;
    this.authorId = authorId;
    this.categoryId = categoryId;
  }

  static create({ name, price, stock, imageUrl, publicationDate, description, language, authorId, categoryId }) {
    return new Book({ name, price, stock, imageUrl, publicationDate, description, language, authorId, categoryId });
  }
}
