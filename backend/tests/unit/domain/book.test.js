import { describe, it, expect } from 'vitest';
import { Book } from '../../../src/book/domain/Book.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';

const valid = {
  name: 'El Quijote',
  price: 19.99,
  stock: 10,
  authorId: 'a1',
  categoryId: 'c1',
};

describe('Book', () => {
  it('crea un libro y aplica defaults', () => {
    const book = Book.create(valid);
    expect(book.name).toBe('El Quijote');
    expect(book.price).toBe(19.99);
    expect(book.stock).toBe(10);
    expect(book.imageUrl).toBeNull();
    expect(book.description).toBeNull();
  });

  it('lanza ValidationError si falta el nombre', () => {
    expect(() => Book.create({ ...valid, name: '' })).toThrow(ValidationError);
    expect(() => Book.create({ ...valid, name: '  ' })).toThrow(ValidationError);
    expect(() => Book.create({ ...valid, name: 42 })).toThrow(ValidationError);
  });

  it.each([undefined, null, -1, '10', NaN])('lanza error con price inválido (%s)', (price) => {
    expect(() => Book.create({ ...valid, price })).toThrow(ValidationError);
  });

  it.each([undefined, null, -1, 1.5, '3'])('lanza error con stock inválido (%s)', (stock) => {
    expect(() => Book.create({ ...valid, stock })).toThrow(ValidationError);
  });

  it('lanza error si falta author o category', () => {
    expect(() => Book.create({ ...valid, authorId: undefined })).toThrow(ValidationError);
    expect(() => Book.create({ ...valid, categoryId: undefined })).toThrow(ValidationError);
  });
});
