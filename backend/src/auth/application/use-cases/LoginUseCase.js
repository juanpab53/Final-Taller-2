import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

/**
 * Login use case.
 * Finds the user by email and validates credentials in a single call.
 */
export class LoginUseCase {
  constructor({ credentialRepository, passwordHasher, tokenService }) {
    this.credentialRepository = credentialRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  /**
   * Executes the login flow.
   * @param {{ email: string, password: string }} data
   */
  async execute({ email, password }) {
    const authData = await this.credentialRepository.findByEmailWithCredentials(email);
    if (!authData || !authData.user || !authData.credential) {
      throw new UnauthorizedError('Invalid credentials.');
    }

    const { user, credential } = authData;
    const ok = await this.passwordHasher.compare(password, credential.getPasswordHash());
    if (!ok) {
      throw new UnauthorizedError('Invalid credentials.');
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
