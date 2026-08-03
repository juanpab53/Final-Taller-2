import { describe, it, expect } from 'vitest';
import { RegisterUserRequestDTO } from '../../../src/user/application/dtos/RegisterUserRequestDTO.js';
import { LoginRequestDTO } from '../../../src/auth/application/dtos/LoginRequestDTO.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';

describe('RegisterUserRequestDTO', () => {
  it('trimea email, name y tel', () => {
    const dto = new RegisterUserRequestDTO({ email: ' A@B.com ', password: 'secret123', name: ' Ana ', tel: ' 555 ' });
    expect(dto.email).toBe('A@B.com');
    expect(dto.name).toBe('Ana');
    expect(dto.tel).toBe('555');
  });

  it('lanza error si falta email', () => {
    expect(() => new RegisterUserRequestDTO({ password: 'secret123' })).toThrow(ValidationError);
  });

  it('lanza error si password es menor a 8 caracteres', () => {
    expect(() => new RegisterUserRequestDTO({ email: 'a@b.com', password: 'short' })).toThrow(ValidationError);
  });

  it.each([42, {}])('lanza error con name inválido (%s)', (name) => {
    expect(() => new RegisterUserRequestDTO({ email: 'a@b.com', password: 'secret123', name })).toThrow(ValidationError);
  });

  it.each([42, {}])('lanza error con tel inválido (%s)', (tel) => {
    expect(() => new RegisterUserRequestDTO({ email: 'a@b.com', password: 'secret123', tel })).toThrow(ValidationError);
  });
});

describe('LoginRequestDTO', () => {
  it('construye un login válido y trimea el email', () => {
    const dto = new LoginRequestDTO({ email: ' A@B.com ', password: 'secret123' });
    expect(dto.email).toBe('A@B.com');
    expect(dto.password).toBe('secret123');
  });

  it.each([undefined, '', '   '])('lanza error sin email (%s)', (email) => {
    expect(() => new LoginRequestDTO({ email, password: 'x' })).toThrow(ValidationError);
  });

  it.each([undefined, '', '   '])('lanza error sin password (%s)', (password) => {
    expect(() => new LoginRequestDTO({ email: 'a@b.com', password })).toThrow(ValidationError);
  });
});
