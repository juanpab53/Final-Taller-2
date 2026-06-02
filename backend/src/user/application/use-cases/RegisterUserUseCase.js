import { ValidationError } from "../../../shared/errors/ValidationError.js";
import { User } from "../../domain/User.js";

// Caso de uso de registro de usuarios.
// No sabe nada de Express ni de Prisma; solo usa puertos/inyecciones.
export class RegisterUserUseCase {
	constructor({ userRepository, passwordHasher }) {
		this.userRepository = userRepository;
		this.passwordHasher = passwordHasher;
	}

	/**
	 * Ejecuta el registro de un usuario.
	 * @param {{ email: string, password: string, name?: string, tel?: string }} data
	 */
	async execute({ email, password, name, tel }) {
		if (!email || !password) {
			throw new ValidationError('Email y password son requeridos.');
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
