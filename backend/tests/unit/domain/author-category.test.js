import { describe, it, expect } from 'vitest';
import { Author } from '../../../src/author/domain/Author.js';
import { Category } from '../../../src/category/domain/Category.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';

describe('Author', () => {
  it('crea un autor y trimea el nombre', () => {
    const author = Author.create({ name: '  Cervantes  ' });
    expect(author.name).toBe('Cervantes');
  });

  it.each([undefined, '', '   ', 5])('lanza error con nombre inválido (%s)', (name) => {
    expect(() => Author.create({ name })).toThrow(ValidationError);
  });
});

describe('Category', () => {
  it('crea una categoría y trimea el nombre', () => {
    const category = Category.create({ name: '  Ficción  ' });
    expect(category.name).toBe('Ficción');
  });

  it.each([undefined, '', '   ', 5])('lanza error con nombre inválido (%s)', (name) => {
    expect(() => Category.create({ name })).toThrow(ValidationError);
  });
});
