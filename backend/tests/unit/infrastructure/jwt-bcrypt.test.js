import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { JwtService } from '../../../src/auth/infrastructure/JwtService.js';
import { BcryptHasher } from '../../../src/auth/infrastructure/BcryptHasher.js';

const OLD_SECRET = process.env.JWT_SECRET;

describe('JwtService', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-for-unit-tests-1234567890';
  });

  afterAll(() => {
    if (OLD_SECRET === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = OLD_SECRET;
  });

  it('firma y verifica un access token con type access', () => {
    const svc = new JwtService();
    const token = svc.signAccessToken({ id: 'u1', email: 'a@b.com', role: 'CLIENT' });
    const payload = svc.verifyAccessToken(token);
    expect(payload.id).toBe('u1');
    expect(payload.role).toBe('CLIENT');
    expect(payload.type).toBe('access');
  });

  it('firma y verifica un refresh token con type refresh', () => {
    const svc = new JwtService();
    const token = svc.signRefreshToken({ id: 'u1' });
    const payload = svc.verifyRefreshToken(token);
    expect(payload.id).toBe('u1');
    expect(payload.type).toBe('refresh');
  });

  it('rechaza un refresh token como access token', () => {
    const svc = new JwtService();
    const refresh = svc.signRefreshToken({ id: 'u1' });
    expect(() => svc.verifyAccessToken(refresh)).toThrow('Invalid token.');
  });

  it('rechaza un access token como refresh token', () => {
    const svc = new JwtService();
    const access = svc.signAccessToken({ id: 'u1', email: 'a@b.com', role: 'CLIENT' });
    expect(() => svc.verifyRefreshToken(access)).toThrow('Invalid refresh token.');
  });

  it('rechaza un token manipulado', () => {
    const svc = new JwtService();
    const token = svc.signAccessToken({ id: 'u1', email: 'a@b.com', role: 'CLIENT' });
    const tampered = token.slice(0, -3) + 'abc';
    expect(() => svc.verifyAccessToken(tampered)).toThrow();
  });

  it('lanza error si falta JWT_SECRET', () => {
    delete process.env.JWT_SECRET;
    expect(() => new JwtService()).toThrow('JWT_SECRET not defined in environment');
  });
});

describe('BcryptHasher', () => {
  it('hashea y compara correctamente', async () => {
    const hasher = new BcryptHasher();
    const hash = await hasher.hash('secret123');
    expect(hash).not.toBe('secret123');
    await expect(hasher.compare('secret123', hash)).resolves.toBe(true);
    await expect(hasher.compare('wrong', hash)).resolves.toBe(false);
  });
});
