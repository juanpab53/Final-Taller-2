import { describe, it, expect } from 'vitest';
import { CreateAuthorDTO } from '../../../src/author/application/dtos/CreateAuthorDTO.js';
import { UpdateAuthorDTO } from '../../../src/author/application/dtos/UpdateAuthorDTO.js';
import { CreateCategoryDTO } from '../../../src/category/application/dtos/CreateCategoryDTO.js';
import { UpdateCategoryDTO } from '../../../src/category/application/dtos/UpdateCategoryDTO.js';
import { CreateOrderDTO } from '../../../src/order/application/dtos/CreateOrderDTO.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';

describe('CreateAuthorDTO / CreateCategoryDTO', () => {
  it.each([
    [CreateAuthorDTO, { name: ' A ' }],
    [CreateCategoryDTO, { name: ' B ' }],
  ])('trimea el nombre', (DTO, input) => {
    expect(new DTO(input).name).toBe(input.name.trim());
  });

  it.each([
    [CreateAuthorDTO, undefined],
    [CreateAuthorDTO, ''],
    [CreateAuthorDTO, '  '],
    [CreateCategoryDTO, undefined],
    [CreateCategoryDTO, ''],
    [CreateCategoryDTO, '  '],
  ])('lanza error sin nombre (%s)', (DTO, name) => {
    expect(() => new DTO({ name })).toThrow(ValidationError);
  });
});

describe('UpdateAuthorDTO / UpdateCategoryDTO', () => {
  it('no falla con objeto vacío', () => {
    expect(new UpdateAuthorDTO({})).toEqual({});
    expect(new UpdateCategoryDTO({})).toEqual({});
  });

  it('trimea name cuando se provee', () => {
    expect(new UpdateAuthorDTO({ name: ' Z ' }).name).toBe('Z');
    expect(new UpdateCategoryDTO({ name: ' W ' }).name).toBe('W');
  });

  it.each(['', '   ', 5])('lanza error con name inválido (%s)', (name) => {
    expect(() => new UpdateAuthorDTO({ name })).toThrow(ValidationError);
    expect(() => new UpdateCategoryDTO({ name })).toThrow(ValidationError);
  });
});

describe('CreateOrderDTO', () => {
  const shipping = { first: ' A ', last: 'B', address: 'C', city: 'D', state: 'E', zip: '123' };

  it('trimea los campos de envío y hace apt opcional', () => {
    const dto = new CreateOrderDTO({ shipping });
    expect(dto.shipping.first).toBe('A');
    expect(dto.shipping.apt).toBe('');
  });

  it('lanza error si falta shipping', () => {
    expect(() => new CreateOrderDTO({})).toThrow(ValidationError);
  });

  it('lanza error si falta un campo requerido', () => {
    const { first, ...rest } = shipping;
    expect(() => new CreateOrderDTO({ shipping: rest })).toThrow(ValidationError);
  });
});
