import { describe, it, expect, vi } from 'vitest';
import { createAuthMiddleware } from '../../../src/shared/middleware/authMiddleware.js';
import { requireRole } from '../../../src/shared/middleware/requireRole.js';
import { errorHandler } from '../../../src/shared/middleware/errorHandler.js';
import { UnauthorizedError } from '../../../src/shared/errors/UnauthorizedError.js';
import { ForbiddenError } from '../../../src/shared/errors/ForbiddenError.js';
import { AppError } from '../../../src/shared/errors/AppError.js';
import { makeReq, makeRes } from '../../helpers/test-utils.js';

describe('createAuthMiddleware', () => {
  it('llama next con UnauthorizedError si no hay token', () => {
    const middleware = createAuthMiddleware({ verifyAccessToken: vi.fn() });
    const next = vi.fn();
    middleware(makeReq({ headers: {} }), {}, next);
    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
  });

  it('setea req.user y llama next con token válido', () => {
    const tokenService = { verifyAccessToken: vi.fn().mockReturnValue({ id: 'u1', email: 'a@b.com', role: 'ADMIN' }) };
    const middleware = createAuthMiddleware(tokenService);
    const req = makeReq({ headers: { authorization: 'Bearer token-123' } });
    const next = vi.fn();

    middleware(req, {}, next);

    expect(req.user).toEqual({ id: 'u1', email: 'a@b.com', role: 'ADMIN' });
    expect(tokenService.verifyAccessToken).toHaveBeenCalledWith('token-123');
    expect(next).toHaveBeenCalledWith();
  });

  it('convierte tokens inválidos en UnauthorizedError', () => {
    const jwtError = new Error('invalid signature');
    jwtError.name = 'JsonWebTokenError';
    const tokenService = { verifyAccessToken: vi.fn().mockImplementation(() => { throw jwtError; }) };
    const middleware = createAuthMiddleware(tokenService);
    const next = vi.fn();

    middleware(makeReq({ headers: { authorization: 'Bearer bad' } }), {}, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
  });
});

describe('requireRole', () => {
  it('llama next con UnauthorizedError si no hay usuario', () => {
    const next = vi.fn();
    requireRole('ADMIN')(makeReq({ user: undefined }), {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
  });

  it('llama next con ForbiddenError si el rol no coincide', () => {
    const next = vi.fn();
    requireRole('ADMIN')(makeReq({ user: { role: 'CLIENT' } }), {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
  });

  it('permite el paso si el rol está incluido', () => {
    const next = vi.fn();
    requireRole('ADMIN', 'CLIENT')(makeReq({ user: { role: 'CLIENT' } }), {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});

describe('errorHandler', () => {
  it('responde con el status y body de un AppError', () => {
    const res = makeRes();
    errorHandler(new AppError('Algo falló', 502, 'PAYMENT_GATEWAY_ERROR'), {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.body).toMatchObject({ success: false, error: { code: 'PAYMENT_GATEWAY_ERROR', message: 'Algo falló' } });
  });

  it('incluye details cuando el error los tiene', () => {
    const res = makeRes();
    const err = new AppError('Invalid', 400, 'X');
    err.details = ['campo'];
    errorHandler(err, {}, res, () => {});
    expect(res.body.error.details).toEqual(['campo']);
  });

  it('responde 500 para errores no operativos', () => {
    const res = makeRes();
    errorHandler(new Error('boom'), {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
