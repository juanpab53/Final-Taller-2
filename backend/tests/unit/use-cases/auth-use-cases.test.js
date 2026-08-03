import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from '../../../src/auth/application/use-cases/LoginUseCase.js';
import { LogoutUseCase } from '../../../src/auth/application/use-cases/LogoutUseCase.js';
import { RefreshTokenUseCase } from '../../../src/auth/application/use-cases/RefreshTokenUseCase.js';
import { UnauthorizedError } from '../../../src/shared/errors/UnauthorizedError.js';

describe('LoginUseCase', () => {
  const user = { id: 'u1', email: 'a@b.com', role: 'CLIENT' };
  const credential = { getPasswordHash: () => 'hash' };

  it('lanza UnauthorizedError si no hay authData', async () => {
    const credentialRepository = { findByEmailWithCredentials: vi.fn().mockResolvedValue(null) };
    const uc = new LoginUseCase({ credentialRepository, passwordHasher: {}, tokenService: {} });
    await expect(uc.execute({ email: 'a@b.com', password: 'x' })).rejects.toThrow(UnauthorizedError);
  });

  it('lanza UnauthorizedError si el password no coincide', async () => {
    const credentialRepository = { findByEmailWithCredentials: vi.fn().mockResolvedValue({ user, credential }) };
    const passwordHasher = { compare: vi.fn().mockResolvedValue(false) };
    const uc = new LoginUseCase({ credentialRepository, passwordHasher, tokenService: {} });
    await expect(uc.execute({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(UnauthorizedError);
    expect(passwordHasher.compare).toHaveBeenCalledWith('wrong', 'hash');
  });

  it('devuelve tokens y payload en login exitoso', async () => {
    const credentialRepository = { findByEmailWithCredentials: vi.fn().mockResolvedValue({ user, credential }) };
    const passwordHasher = { compare: vi.fn().mockResolvedValue(true) };
    const tokenService = {
      signAccessToken: vi.fn().mockReturnValue('access-token'),
      signRefreshToken: vi.fn().mockReturnValue('refresh-token'),
    };
    const uc = new LoginUseCase({ credentialRepository, passwordHasher, tokenService });

    const result = await uc.execute({ email: 'a@b.com', password: 'secret123' });

    expect(tokenService.signAccessToken).toHaveBeenCalledWith({ id: 'u1', email: 'a@b.com', role: 'CLIENT' });
    expect(tokenService.signRefreshToken).toHaveBeenCalledWith({ id: 'u1' });
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      payload: { id: 'u1', email: 'a@b.com', role: 'CLIENT' },
    });
  });
});

describe('LogoutUseCase', () => {
  it('retorna success', async () => {
    const uc = new LogoutUseCase();
    await expect(uc.execute()).resolves.toEqual({ success: true, message: 'Logout successful.' });
  });
});

describe('RefreshTokenUseCase', () => {
  const tokenService = {
    verifyRefreshToken: vi.fn(),
    signAccessToken: vi.fn().mockReturnValue('access'),
    signRefreshToken: vi.fn().mockReturnValue('refresh'),
  };
  const user = { id: 'u1', email: 'a@b.com', role: 'ADMIN' };

  it('lanza UnauthorizedError sin refresh token', async () => {
    const uc = new RefreshTokenUseCase({ tokenService, userRepository: {} });
    await expect(uc.execute({})).rejects.toThrow(UnauthorizedError);
  });

  it('lanza UnauthorizedError si el token no verifica', async () => {
    tokenService.verifyRefreshToken.mockRejectedValue(new Error('expired'));
    const userRepository = { findById: vi.fn() };
    const uc = new RefreshTokenUseCase({ tokenService, userRepository });
    await expect(uc.execute({ refreshToken: 'bad' })).rejects.toThrow(UnauthorizedError);
  });

  it('lanza UnauthorizedError si el usuario no existe', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ id: 'u1' });
    const userRepository = { findById: vi.fn().mockResolvedValue(null) };
    const uc = new RefreshTokenUseCase({ tokenService, userRepository });
    await expect(uc.execute({ refreshToken: 't' })).rejects.toThrow(UnauthorizedError);
  });

  it('emite nuevos tokens y payload cuando todo es válido', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ id: 'u1' });
    const userRepository = { findById: vi.fn().mockResolvedValue(user) };
    const uc = new RefreshTokenUseCase({ tokenService, userRepository });

    const result = await uc.execute({ refreshToken: 'valid' });

    expect(tokenService.signAccessToken).toHaveBeenCalledWith({ id: 'u1', email: 'a@b.com', role: 'ADMIN' });
    expect(result).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
      payload: { id: 'u1', email: 'a@b.com', role: 'ADMIN' },
    });
  });
});
