import { describe, it, expect } from 'vitest';
import { Email } from '../../../src/user/domain/Email.js';
import { ValidationError } from '../../../src/shared/errors/ValidationError.js';

describe('Email', () => {
  it('normaliza el email a minúsculas y sin espacios', () => {
    const email = new Email('  User@Example.COM  ');
    expect(email.toString()).toBe('user@example.com');
  });

  it('acepta emails válidos simples', () => {
    expect(new Email('a@b.co').toString()).toBe('a@b.co');
    expect(new Email('x.y@sub.example.com').toString()).toBe('x.y@sub.example.com');
  });

  it.each([undefined, null, '', 'not-an-email', 'a@b', '@dominio.com', '  '])(
    'lanza ValidationError para el valor "%s"',
    (value) => {
      expect(() => new Email(value)).toThrow(ValidationError);
    }
  );
});
