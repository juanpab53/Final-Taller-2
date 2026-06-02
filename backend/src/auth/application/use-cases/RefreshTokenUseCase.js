import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

export class RefreshTokenUseCase {
  constructor({ tokenService, userRepository }) {
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  async execute({ refreshToken }) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token no proporcionado.');
    }

    let payload;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new UnauthorizedError('Refresh token inválido o expirado.');
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado para refresh token.');
    }

    const accessToken = this.tokenService.signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = this.tokenService.signRefreshToken({ id: user.id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      payload: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
