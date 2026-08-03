import { describe, it, expect } from 'vitest';
import { User } from '../../../src/user/domain/User.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';

describe('User', () => {
  it('crea un usuario con defaults por defecto', () => {
    const user = User.create({ email: 'juan@example.com', passwordHash: 'hash' });
    expect(user.name).toBe('');
    expect(user.tel).toBe('');
    expect(user.role).toBe('CLIENT');
    expect(user.email).toBe('juan@example.com');
    expect(user.passwordHash).toBe('hash');
  });

  it('normaliza el email y respeta id/name/tel/role', () => {
    const user = new User({
      id: 'u1',
      name: 'Ana',
      email: 'Ana@Example.com',
      tel: '555',
      role: 'ADMIN',
      passwordHash: 'h',
    });
    expect(user.id).toBe('u1');
    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@example.com');
    expect(user.role).toBe('ADMIN');
  });

  it('lanza ValidationError si falta el email', () => {
    expect(() => User.create({ passwordHash: 'hash' })).toThrow(ValidationError);
  });

  it('lanza ValidationError si el email es inválido', () => {
    expect(() => User.create({ email: 'mal', passwordHash: 'hash' })).toThrow(ValidationError);
  });

  it('toPublic no expone el passwordHash', () => {
    const user = User.create({ email: 'a@b.com', passwordHash: 'secret', name: 'N' });
    expect(user.toPublic()).toEqual({
      id: undefined,
      email: 'a@b.com',
      name: 'N',
      tel: '',
      role: 'CLIENT',
    });
  });
});
