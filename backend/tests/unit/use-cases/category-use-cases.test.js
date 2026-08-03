import { describe, it, expect, vi } from 'vitest';
import { CreateCategoryUseCase } from '../../../src/category/application/use-cases/CreateCategoryUseCase.js';
import { ListCategoriesUseCase } from '../../../src/category/application/use-cases/ListCategoriesUseCase.js';
import { GetCategoryUseCase } from '../../../src/category/application/use-cases/GetCategoryUseCase.js';
import { UpdateCategoryUseCase } from '../../../src/category/application/use-cases/UpdateCategoryUseCase.js';
import { DeleteCategoryUseCase } from '../../../src/category/application/use-cases/DeleteCategoryUseCase.js';
import { NotFoundError } from '../../../src/shared/errors/NotFoundError.js';

describe('CreateCategoryUseCase', () => {
  it('crea la entidad Category y la guarda', async () => {
    const categoryRepository = { save: vi.fn().mockResolvedValue({ id: 'c1', name: 'X' }) };
    const uc = new CreateCategoryUseCase({ categoryRepository });
    const result = await uc.execute({ name: 'Ficción' });
    expect(result).toEqual({ id: 'c1', name: 'X' });
    expect(categoryRepository.save.mock.calls[0][0].name).toBe('Ficción');
  });
});

describe('ListCategoriesUseCase', () => {
  it('usa findAll sin filtro', async () => {
    const categoryRepository = { findAll: vi.fn().mockResolvedValue([]), findByName: vi.fn() };
    const uc = new ListCategoriesUseCase({ categoryRepository });
    await uc.execute();
    expect(categoryRepository.findAll).toHaveBeenCalledOnce();
  });

  it('usa findByName con filtro', async () => {
    const categoryRepository = { findAll: vi.fn(), findByName: vi.fn().mockResolvedValue([]) };
    const uc = new ListCategoriesUseCase({ categoryRepository });
    await uc.execute({ name: 'Fic' });
    expect(categoryRepository.findByName).toHaveBeenCalledWith('Fic');
  });
});

describe('GetCategoryUseCase', () => {
  it('devuelve la categoría encontrada', async () => {
    const categoryRepository = { findById: vi.fn().mockResolvedValue({ id: 'c1', name: 'X' }) };
    const uc = new GetCategoryUseCase({ categoryRepository });
    await expect(uc.execute({ id: 'c1' })).resolves.toEqual({ id: 'c1', name: 'X' });
  });

  it('lanza NotFoundError si no existe', async () => {
    const categoryRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new GetCategoryUseCase({ categoryRepository });
    await expect(uc.execute({ id: 'x' })).rejects.toThrow(NotFoundError);
  });
});

describe('UpdateCategoryUseCase', () => {
  it('actualiza solo campos definidos', async () => {
    const categoryRepository = { update: vi.fn().mockResolvedValue({ id: 'c1', name: 'Nuevo' }) };
    const uc = new UpdateCategoryUseCase({ categoryRepository });
    const result = await uc.execute({ id: 'c1', dto: { name: 'Nuevo' } });
    expect(categoryRepository.update).toHaveBeenCalledWith('c1', { name: 'Nuevo' });
    expect(result.name).toBe('Nuevo');
  });
});

describe('DeleteCategoryUseCase', () => {
  it('elimina por id', async () => {
    const categoryRepository = { delete: vi.fn().mockResolvedValue(undefined) };
    const uc = new DeleteCategoryUseCase({ categoryRepository });
    await uc.execute({ id: 'c1' });
    expect(categoryRepository.delete).toHaveBeenCalledWith('c1');
  });
});
