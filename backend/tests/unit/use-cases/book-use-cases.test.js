import { describe, it, expect, vi } from 'vitest';
import { CreateBookUseCase } from '../../../src/book/application/use-cases/CreateBookUseCase.js';
import { ListBooksUseCase } from '../../../src/book/application/use-cases/ListBooksUseCase.js';
import { GetBookUseCase } from '../../../src/book/application/use-cases/GetBookUseCase.js';
import { UpdateBookUseCase } from '../../../src/book/application/use-cases/UpdateBookUseCase.js';
import { DeleteBookUseCase } from '../../../src/book/application/use-cases/DeleteBookUseCase.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';
import { NotFoundError } from '../../../src/shared/errors/NotFoundError.js';

const dto = {
  name: 'Libro',
  price: 9.99,
  stock: 3,
  authorId: 'a1',
  categoryId: 'c1',
};

describe('CreateBookUseCase', () => {
  it('lanza ValidationError si el autor no existe', async () => {
    const authorRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new CreateBookUseCase({ bookRepository: {}, authorRepository, categoryRepository: {} });
    await expect(uc.execute(dto)).rejects.toThrow(ValidationError);
  });

  it('lanza ValidationError si la categoría no existe', async () => {
    const authorRepository = { findById: vi.fn().mockResolvedValue({ id: 'a1' }) };
    const categoryRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new CreateBookUseCase({ bookRepository: {}, authorRepository, categoryRepository });
    await expect(uc.execute(dto)).rejects.toThrow(ValidationError);
  });

  it('guarda el libro cuando autor y categoría existen', async () => {
    const authorRepository = { findById: vi.fn().mockResolvedValue({ id: 'a1' }) };
    const categoryRepository = { findById: vi.fn().mockResolvedValue({ id: 'c1' }) };
    const bookRepository = { save: vi.fn().mockResolvedValue({ id: 'b1', name: 'Libro' }) };
    const uc = new CreateBookUseCase({ bookRepository, authorRepository, categoryRepository });

    const result = await uc.execute(dto);
    expect(result).toEqual({ id: 'b1', name: 'Libro' });
    const saved = bookRepository.save.mock.calls[0][0];
    expect(saved.price).toBe(9.99);
    expect(saved.authorId).toBe('a1');
  });
});

describe('ListBooksUseCase', () => {
  it('pasa filtros y pagina con defaults', async () => {
    const bookRepository = { findAll: vi.fn().mockResolvedValue({ items: [], total: 0 }) };
    const uc = new ListBooksUseCase({ bookRepository });
    await uc.execute();
    expect(bookRepository.findAll).toHaveBeenCalledWith({ search: undefined, categoryId: undefined, authorId: undefined }, 1, 12);
  });

  it('pasa filtros explícitos', async () => {
    const bookRepository = { findAll: vi.fn().mockResolvedValue({ items: [], total: 0 }) };
    const uc = new ListBooksUseCase({ bookRepository });
    await uc.execute({ search: 'x', categoryId: 'c1', authorId: 'a1', page: '2', limit: '5' });
    expect(bookRepository.findAll).toHaveBeenCalledWith({ search: 'x', categoryId: 'c1', authorId: 'a1' }, 2, 5);
  });
});

describe('GetBookUseCase', () => {
  it('devuelve el libro encontrado', async () => {
    const bookRepository = { findById: vi.fn().mockResolvedValue({ id: 'b1' }) };
    const uc = new GetBookUseCase({ bookRepository });
    await expect(uc.execute({ id: 'b1' })).resolves.toEqual({ id: 'b1' });
  });

  it('lanza NotFoundError si no existe', async () => {
    const bookRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new GetBookUseCase({ bookRepository });
    await expect(uc.execute({ id: 'x' })).rejects.toThrow(NotFoundError);
  });
});

describe('UpdateBookUseCase', () => {
  it('valida autor cuando se provee authorId', async () => {
    const authorRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new UpdateBookUseCase({ bookRepository: {}, authorRepository, categoryRepository: {} });
    await expect(uc.execute({ id: 'b1', dto: { authorId: 'a1' } })).rejects.toThrow(ValidationError);
  });

  it('valida categoría cuando se provee categoryId', async () => {
    const categoryRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new UpdateBookUseCase({ bookRepository: {}, authorRepository: {}, categoryRepository });
    await expect(uc.execute({ id: 'b1', dto: { categoryId: 'c1' } })).rejects.toThrow(ValidationError);
  });

  it('actualiza sin validar si no se cambian relaciones', async () => {
    const bookRepository = { update: vi.fn().mockResolvedValue({ id: 'b1', price: 12 }) };
    const uc = new UpdateBookUseCase({ bookRepository, authorRepository: {}, categoryRepository: {} });
    const result = await uc.execute({ id: 'b1', dto: { price: 12 } });
    expect(bookRepository.update).toHaveBeenCalledWith('b1', { price: 12 });
    expect(result.price).toBe(12);
  });
});

describe('DeleteBookUseCase', () => {
  it('elimina por id', async () => {
    const bookRepository = { delete: vi.fn().mockResolvedValue(undefined) };
    const uc = new DeleteBookUseCase({ bookRepository });
    await uc.execute({ id: 'b1' });
    expect(bookRepository.delete).toHaveBeenCalledWith('b1');
  });
});
