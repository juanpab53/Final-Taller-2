import { describe, it, expect, vi } from 'vitest';
import { BookController } from '../../../src/book/infrastructure/BookController.js';
import { AuthorController } from '../../../src/author/infrastructure/AuthorController.js';
import { CategoryController } from '../../../src/category/infrastructure/CategoryController.js';
import { makeReq, makeRes } from '../../helpers/test-utils.js';

function bookControllerWith(overrides = {}) {
  const useCases = {
    createBookUseCase: { execute: vi.fn().mockResolvedValue({ id: 'b1' }) },
    listBooksUseCase: { execute: vi.fn().mockResolvedValue({ items: [], total: 0 }) },
    getBookUseCase: { execute: vi.fn().mockResolvedValue({ id: 'b1' }) },
    updateBookUseCase: { execute: vi.fn().mockResolvedValue({ id: 'b1' }) },
    deleteBookUseCase: { execute: vi.fn().mockResolvedValue(undefined) },
    ...overrides,
  };
  return { useCases, controller: new BookController(useCases) };
}

describe('BookController', () => {
  it('create responde 201', async () => {
    const { useCases, controller } = bookControllerWith();
    const res = makeRes();
    await controller.create(makeReq({ body: { name: 'Libro', price: 10, stock: 2, authorId: 'a1', categoryId: 'c1' } }), res);
    expect(useCases.createBookUseCase.execute).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.body.data.id).toBe('b1');
  });

  it('list responde con items y total', async () => {
    const { useCases, controller } = bookControllerWith();
    const res = makeRes();
    await controller.list(makeReq({ query: { page: '1', limit: '12' } }), res);
    expect(useCases.listBooksUseCase.execute).toHaveBeenCalledWith({ search: undefined, categoryId: undefined, authorId: undefined, page: '1', limit: '12' });
    expect(res.body).toEqual({ success: true, items: [], total: 0 });
  });

  it('getById responde con el libro', async () => {
    const { controller } = bookControllerWith();
    const res = makeRes();
    await controller.getById(makeReq({ params: { id: 'b1' } }), res);
    expect(res.body).toEqual({ success: true, data: { id: 'b1' } });
  });

  it('delete responde con mensaje', async () => {
    const { useCases, controller } = bookControllerWith();
    const res = makeRes();
    await controller.delete(makeReq({ params: { id: 'b1' } }), res);
    expect(useCases.deleteBookUseCase.execute).toHaveBeenCalledWith({ id: 'b1' });
    expect(res.body).toEqual({ success: true, data: { message: 'Book deleted successfully.' } });
  });
});

function crudControllerWith(Controller, name, plural = `${name}s`) {
  const useCases = {
    [`create${name}UseCase`]: { execute: vi.fn().mockResolvedValue({ id: 'x1' }) },
    [`list${plural}UseCase`]: { execute: vi.fn().mockResolvedValue([{ id: 'x1' }]) },
    [`get${name}UseCase`]: { execute: vi.fn().mockResolvedValue({ id: 'x1' }) },
    [`update${name}UseCase`]: { execute: vi.fn().mockResolvedValue({ id: 'x1' }) },
    [`delete${name}UseCase`]: { execute: vi.fn().mockResolvedValue(undefined) },
  };
  return { useCases, controller: new Controller(useCases) };
}

describe('AuthorController', () => {
  it('create responde 201 y list responde la lista', async () => {
    const { useCases, controller } = crudControllerWith(AuthorController, 'Author');
    const res = makeRes();
    await controller.create(makeReq({ body: { name: 'X' } }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    await controller.list(makeReq({ query: {} }), res);
    expect(useCases.listAuthorsUseCase.execute).toHaveBeenCalledWith({ name: undefined });
    expect(res.body).toEqual({ success: true, data: [{ id: 'x1' }] });
  });

  it('update y delete delegan al use case', async () => {
    const { useCases, controller } = crudControllerWith(AuthorController, 'Author');
    const res = makeRes();
    await controller.update(makeReq({ params: { id: 'a1' }, body: { name: 'Nuevo' } }), res);
    expect(useCases.updateAuthorUseCase.execute).toHaveBeenCalledWith({ id: 'a1', dto: expect.any(Object) });
    await controller.delete(makeReq({ params: { id: 'a1' } }), res);
    expect(useCases.deleteAuthorUseCase.execute).toHaveBeenCalledWith({ id: 'a1' });
  });
});

describe('CategoryController', () => {
  it('create responde 201 y list usa el filtro name', async () => {
    const { useCases, controller } = crudControllerWith(CategoryController, 'Category', 'Categories');
    const res = makeRes();
    await controller.create(makeReq({ body: { name: 'Ficción' } }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    await controller.list(makeReq({ query: { name: 'Fic' } }), res);
    expect(useCases.listCategoriesUseCase.execute).toHaveBeenCalledWith({ name: 'Fic' });
  });
});
