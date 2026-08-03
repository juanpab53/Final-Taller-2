import { describe, it, expect, vi } from 'vitest';
import { CreateAuthorUseCase } from '../../../src/author/application/use-cases/CreateAuthorUseCase.js';
import { ListAuthorsUseCase } from '../../../src/author/application/use-cases/ListAuthorsUseCase.js';
import { GetAuthorUseCase } from '../../../src/author/application/use-cases/GetAuthorUseCase.js';
import { UpdateAuthorUseCase } from '../../../src/author/application/use-cases/UpdateAuthorUseCase.js';
import { DeleteAuthorUseCase } from '../../../src/author/application/use-cases/DeleteAuthorUseCase.js';
import { NotFoundError } from '../../../src/shared/errors/NotFoundError.js';

describe('CreateAuthorUseCase', () => {
  it('crea la entidad Author y la guarda', async () => {
    const authorRepository = { save: vi.fn().mockResolvedValue({ id: 'a1', name: 'X' }) };
    const uc = new CreateAuthorUseCase({ authorRepository });
    const result = await uc.execute({ name: 'Cervantes' });
    expect(result).toEqual({ id: 'a1', name: 'X' });
    expect(authorRepository.save.mock.calls[0][0].name).toBe('Cervantes');
  });
});

describe('ListAuthorsUseCase', () => {
  it('usa findAll sin filtro', async () => {
    const authorRepository = { findAll: vi.fn().mockResolvedValue([]), findByName: vi.fn() };
    const uc = new ListAuthorsUseCase({ authorRepository });
    await uc.execute();
    expect(authorRepository.findAll).toHaveBeenCalledOnce();
    expect(authorRepository.findByName).not.toHaveBeenCalled();
  });

  it('usa findByName con filtro', async () => {
    const authorRepository = { findAll: vi.fn(), findByName: vi.fn().mockResolvedValue([]) };
    const uc = new ListAuthorsUseCase({ authorRepository });
    await uc.execute({ name: 'Cer' });
    expect(authorRepository.findByName).toHaveBeenCalledWith('Cer');
  });
});

describe('GetAuthorUseCase', () => {
  it('devuelve el autor encontrado', async () => {
    const authorRepository = { findById: vi.fn().mockResolvedValue({ id: 'a1', name: 'X' }) };
    const uc = new GetAuthorUseCase({ authorRepository });
    await expect(uc.execute({ id: 'a1' })).resolves.toEqual({ id: 'a1', name: 'X' });
  });

  it('lanza NotFoundError si no existe', async () => {
    const authorRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new GetAuthorUseCase({ authorRepository });
    await expect(uc.execute({ id: 'x' })).rejects.toThrow(NotFoundError);
  });
});

describe('UpdateAuthorUseCase', () => {
  it('actualiza solo campos definidos en el dto', async () => {
    const authorRepository = { update: vi.fn().mockResolvedValue({ id: 'a1', name: 'Nuevo' }) };
    const uc = new UpdateAuthorUseCase({ authorRepository });
    const result = await uc.execute({ id: 'a1', dto: { name: 'Nuevo' } });
    expect(authorRepository.update).toHaveBeenCalledWith('a1', { name: 'Nuevo' });
    expect(result.name).toBe('Nuevo');
  });
});

describe('DeleteAuthorUseCase', () => {
  it('elimina por id', async () => {
    const authorRepository = { delete: vi.fn().mockResolvedValue(undefined) };
    const uc = new DeleteAuthorUseCase({ authorRepository });
    await uc.execute({ id: 'a1' });
    expect(authorRepository.delete).toHaveBeenCalledWith('a1');
  });
});
