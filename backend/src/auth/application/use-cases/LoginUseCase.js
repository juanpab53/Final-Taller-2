import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

// Caso de uso de login. Localiza el usuario, valida credenciales y genera tokens.
export class LoginUseCase {
	constructor({ userRepository, credentialRepository, passwordHasher, tokenService }) {
		this.userRepository = userRepository;
		this.credentialRepository = credentialRepository;
		this.passwordHasher = passwordHasher;
		this.tokenService = tokenService;
	}

	/**
	 * Ejecuta el flujo de login.
	 * @param {{ email: string, password: string }} data
	 */
	async execute({ email, password }) {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new UnauthorizedError('Credenciales inválidas');
		}

		const cred = await this.credentialRepository.findByUserId(user.id);
		if (!cred) {
			throw new UnauthorizedError('Credenciales inválidas');
		}

		const ok = await this.passwordHasher.compare(password, cred.getPasswordHash());
		if (!ok) {
			throw new UnauthorizedError('Credenciales inválidas');
		}

		const accessToken = this.tokenService.signAccessToken({ id: user.id, email: user.email, role: user.role });
		const refreshToken = this.tokenService.signRefreshToken({ id: user.id });

		return {
			accessToken,
			refreshToken,
			payload: {
				id: user.id,
				email: user.email,
				role: user.role,
			},
		};
	}
}
