import { describe, it, expect, vi } from 'vitest';
import { RegisterUserUseCase } from '../../../src/user/application/use-cases/RegisterUserUseCase.js';
import { GetUserProfileUseCase } from '../../../src/user/application/use-cases/GetUserProfileUseCase.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';
import { NotFoundError } from '../../../src/shared/errors/NotFoundError.js';
import { User } from '../../../src/user/domain/User.js';

describe('RegisterUserUseCase', () => {
  it('lanza ValidationError si falta email o password', async () => {
    const uc = new RegisterUserUseCase({ userRepository: {}, passwordHasher: {} });
    await expect(uc.execute({})).rejects.toThrow(ValidationError);
    await expect(uc.execute({ email: 'a@b.com' })).rejects.toThrow(ValidationError);
  });

  it('hashea el password, crea y guarda el usuario, y devuelve datos públicos', async () => {
    const passwordHasher = { hash: vi.fn().mockResolvedValue('hashed') };
    const saved = new User({ id: 'u1', name: 'Ana', email: 'ana@x.com', tel: '555', role: 'CLIENT', passwordHash: 'hashed' });
    const userRepository = { save: vi.fn().mockResolvedValue(saved) };
    const uc = new RegisterUserUseCase({ userRepository, passwordHasher });

    const result = await uc.execute({ email: 'ana@x.com', password: 'secret123', name: 'Ana', tel: '555' });

    expect(passwordHasher.hash).toHaveBeenCalledWith('secret123');
    expect(userRepository.save).toHaveBeenCalledOnce();
    const savedArg = userRepository.save.mock.calls[0][0];
    expect(savedArg.passwordHash).toBe('hashed');
    expect(savedArg.email).toBe('ana@x.com');
    expect(result).toEqual({ id: 'u1', email: 'ana@x.com', name: 'Ana', tel: '555', role: 'CLIENT' });
  });
});

describe('GetUserProfileUseCase', () => {
  it('devuelve el perfil público del usuario', async () => {
    const user = new User({ id: 'u1', email: 'a@x.com', name: 'Ana', role: 'CLIENT' });
    const userRepository = { findById: vi.fn().mockResolvedValue(user) };
    const uc = new GetUserProfileUseCase({ userRepository });

    const result = await uc.execute({ userId: 'u1' });
    expect(result).toEqual({ id: 'u1', email: 'a@x.com', name: 'Ana', tel: '', role: 'CLIENT' });
  });

  it('lanza NotFoundError si el usuario no existe', async () => {
    const userRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new GetUserProfileUseCase({ userRepository });
    await expect(uc.execute({ userId: 'nope' })).rejects.toThrow(NotFoundError);
  });
});
