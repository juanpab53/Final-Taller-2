import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";

export class RefreshTokenUseCase {
  constructor({ tokenService, userRepository }) {
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  async execute({ refreshToken }) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token not provided.');
    }

    let payload;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new UnauthorizedError('Refresh token invalid or expired.');
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedError('User not found for refresh token.');
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
