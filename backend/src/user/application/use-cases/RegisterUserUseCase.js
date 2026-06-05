import { ValidationError } from "../../../shared/errors/ValidationError.js";
import { User } from "../../domain/User.js";

// User registration use case.
// It does not know about Express or Prisma; it only uses ports/injections.
export class RegisterUserUseCase {
	constructor({ userRepository, passwordHasher }) {
		this.userRepository = userRepository;
		this.passwordHasher = passwordHasher;
	}

	/**
	 * Executes user registration.
	 * @param {{ email: string, password: string, name?: string, tel?: string }} data
	 */
	async execute({ email, password, name, tel }) {
		if (!email || !password) {
			throw new ValidationError('Email and password are required.');
		}

		const passwordHash = await this.passwordHasher.hash(password);
		const user = User.create({
			name,
			email,
			tel,
			passwordHash,
		});

		const created = await this.userRepository.save(user);
		return created;
	}
}
