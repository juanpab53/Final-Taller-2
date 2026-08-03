import { describe, it, expect, vi } from 'vitest';
import { UserController } from '../../../src/user/infrastructure/UserController.js';
import { AuthController } from '../../../src/auth/infrastructure/AuthController.js';
import { UnauthorizedError } from '../../../src/shared/errors/UnauthorizedError.js';
import { makeReq, makeRes } from '../../helpers/test-utils.js';

describe('UserController', () => {
  it('register responde 201 con el usuario creado', async () => {
    const registerUserUseCase = { execute: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }) };
    const controller = new UserController({ registerUserUseCase, getProfileUseCase: {} });
    const req = makeReq({ body: { email: 'a@b.com', password: 'secret123', name: 'Ana' } });
    const res = makeRes();

    await controller.register(req, res);

    expect(registerUserUseCase.execute).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.body).toEqual({ success: true, data: { id: 'u1', email: 'a@b.com' } });
  });

  it('getProfile responde con el perfil del usuario autenticado', async () => {
    const getProfileUseCase = { execute: vi.fn().mockResolvedValue({ id: 'u1' }) };
    const controller = new UserController({ registerUserUseCase: {}, getProfileUseCase });
    const res = makeRes();

    await controller.getProfile(makeReq(), res);

    expect(getProfileUseCase.execute).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(res.body).toEqual({ success: true, data: { id: 'u1' } });
  });
});

describe('AuthController', () => {
  it('login setea la cookie de refresh y devuelve access token', async () => {
    const loginUseCase = {
      execute: vi.fn().mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        payload: { id: 'u1', email: 'a@b.com', role: 'CLIENT' },
      }),
    };
    const controller = new AuthController({ loginUseCase, refreshTokenUseCase: {}, logoutUseCase: {} });
    const res = makeRes();

    await controller.login(makeReq({ body: { email: 'a@b.com', password: 'secret123' } }), res);

    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh', expect.objectContaining({ httpOnly: true }));
    expect(res.body).toEqual({
      success: true,
      data: { accessToken: 'access', user: { id: 'u1', email: 'a@b.com', role: 'CLIENT' } },
    });
  });

  it('refresh lanza UnauthorizedError si no hay cookie', async () => {
    const controller = new AuthController({ loginUseCase: {}, refreshTokenUseCase: {}, logoutUseCase: {} });
    await expect(controller.refresh(makeReq({ cookies: {} }), makeRes())).rejects.toThrow(UnauthorizedError);
  });

  it('refresh renueva la cookie y devuelve nuevo access token', async () => {
    const refreshTokenUseCase = {
      execute: vi.fn().mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        payload: { id: 'u1', email: 'a@b.com', role: 'CLIENT' },
      }),
    };
    const controller = new AuthController({ loginUseCase: {}, refreshTokenUseCase, logoutUseCase: {} });
    const res = makeRes();

    await controller.refresh(makeReq({ cookies: { refreshToken: 'old-refresh' } }), res);

    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'old-refresh' });
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh', expect.any(Object));
    expect(res.body.data.accessToken).toBe('new-access');
  });

  it('logout limpia la cookie', async () => {
    const logoutUseCase = { execute: vi.fn().mockResolvedValue({ success: true }) };
    const controller = new AuthController({ loginUseCase: {}, refreshTokenUseCase: {}, logoutUseCase });
    const res = makeRes();

    await controller.logout(makeReq(), res);

    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
    expect(res.body).toEqual({ success: true, data: { message: 'Logout successful.' } });
  });
});
