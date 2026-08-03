import { describe, it, expect } from 'vitest';
import { CreateBookDTO } from '../../../src/book/application/dtos/CreateBookDTO.js';
import { UpdateBookDTO } from '../../../src/book/application/dtos/UpdateBookDTO.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';

const valid = {
  name: 'Libro',
  price: 9.99,
  stock: 5,
  authorId: 'a1',
  categoryId: 'c1',
};

describe('CreateBookDTO', () => {
  it('construye y aplica defaults de language y publicationDate', () => {
    const dto = new CreateBookDTO(valid);
    expect(dto.language).toBe('English');
    expect(dto.publicationDate).toBeInstanceOf(Date);
  });

  it('convierte publicationDate a Date si se provee', () => {
    const dto = new CreateBookDTO({ ...valid, publicationDate: '2020-01-01' });
    expect(dto.publicationDate.getUTCFullYear()).toBe(2020);
  });

  it.each([undefined, '', '   ', 5])('lanza error con nombre inválido (%s)', (name) => {
    expect(() => new CreateBookDTO({ ...valid, name })).toThrow(ValidationError);
  });

  it.each([undefined, -1, '10', NaN])('lanza error con price inválido (%s)', (price) => {
    expect(() => new CreateBookDTO({ ...valid, price })).toThrow(ValidationError);
  });

  it.each([undefined, -1, 1.5])('lanza error con stock inválido (%s)', (stock) => {
    expect(() => new CreateBookDTO({ ...valid, stock })).toThrow(ValidationError);
  });

  it('lanza error si falta author o category', () => {
    expect(() => new CreateBookDTO({ ...valid, authorId: undefined })).toThrow(ValidationError);
    expect(() => new CreateBookDTO({ ...valid, categoryId: undefined })).toThrow(ValidationError);
  });
});

describe('UpdateBookDTO', () => {
  it('permite actualización parcial', () => {
    const dto = new UpdateBookDTO({ name: 'Nuevo', price: 12.5 });
    expect(dto.name).toBe('Nuevo');
    expect(dto.price).toBe(12.5);
    expect(dto.stock).toBeUndefined();
  });

  it('no falla con objeto vacío', () => {
    const dto = new UpdateBookDTO({});
    expect(dto).toEqual({});
  });

  it.each(['', '   ', 5])('lanza error con name inválido (%s)', (name) => {
    expect(() => new UpdateBookDTO({ name })).toThrow(ValidationError);
  });

  it.each([-1, '10'])('lanza error con price inválido (%s)', (price) => {
    expect(() => new UpdateBookDTO({ price })).toThrow(ValidationError);
  });

  it.each([-1, 1.5, '3'])('lanza error con stock inválido (%s)', (stock) => {
    expect(() => new UpdateBookDTO({ stock })).toThrow(ValidationError);
  });
});
