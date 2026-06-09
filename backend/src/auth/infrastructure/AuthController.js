import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";
import { LoginRequestDTO } from "../application/dtos/LoginRequestDTO.js";

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const SECURE_COOKIES = process.env.NODE_ENV === 'production';

export class AuthController {
  constructor({ loginUseCase, refreshTokenUseCase, logoutUseCase }) {
    this.loginUseCase = loginUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
    this.logoutUseCase = logoutUseCase;
  }

  async login(req, res) {
    const request = new LoginRequestDTO(req.body);
    const result = await this.loginUseCase.execute(request);

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: SECURE_COOKIES,
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.payload,
      },
    });
  }

  async refresh(req, res) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token not provided.');
    }

    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: SECURE_COOKIES,
      sameSite: 'strict',
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.payload,
      },
    });
  }

  async logout(req, res) {
    await this.logoutUseCase.execute();

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: SECURE_COOKIES,
      sameSite: 'strict',
    });

    res.json({
      success: true,
      data: {
        message: 'Logout successful.',
      },
    });
  }
}
