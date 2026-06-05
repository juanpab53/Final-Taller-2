import bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/PasswordHasher.js';

const SALT_ROUNDS = 12;

// Concrete PasswordHasher implementation using bcrypt.
export class BcryptHasher extends PasswordHasher {
	async hash(raw) {
		return bcrypt.hash(raw, SALT_ROUNDS);
	}

	async compare(raw, hash) {
		return bcrypt.compare(raw, hash);
	}
}
