import bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/PasswordHasher.js';

const SALT_ROUNDS = 12;

// Implementación concreta de PasswordHasher usando bcrypt.
export class BcryptHasher extends PasswordHasher {
	async hash(raw) {
		return bcrypt.hash(raw, SALT_ROUNDS);
	}

	async compare(raw, hash) {
		return bcrypt.compare(raw, hash);
	}
}
