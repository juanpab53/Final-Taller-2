import jwt from 'jsonwebtoken';
import { TokenService } from '../domain/TokenService.js';

const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';
const ACCESS_TOKEN_TYPE = 'access';
const REFRESH_TOKEN_TYPE = 'refresh';

export class JwtService extends TokenService {
  constructor() {
    super();
    this.secret = process.env.JWT_SECRET;
    if (!this.secret) {
      throw new Error('JWT_SECRET not defined in environment');
    }
  }

  /**
   * Signs a short-lived access token.
   * @param {{ id: string, email: string, role: string }} payload
   * @returns {string}
   */
  signAccessToken(payload) {
    return jwt.sign({ ...payload, type: ACCESS_TOKEN_TYPE }, this.secret, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
  }

  /**
   * Signs a long-lived refresh token.
   * @param {{ id: string }} payload
   * @returns {string}
   */
  signRefreshToken(payload) {
    return jwt.sign({ ...payload, type: REFRESH_TOKEN_TYPE }, this.secret, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });
  }

  /**
   * Verifies and decodes an access token.
   * @param {string} token
   * @returns {{ id: string, email: string, role: string }}
   */
  verifyAccessToken(token) {
    const payload = jwt.verify(token, this.secret);
    if (payload.type !== ACCESS_TOKEN_TYPE) {
      throw new Error('Invalid token.');
    }
    return payload;
  }

  /**
   * Verifies and decodes a refresh token.
   * @param {string} token
   * @returns {{ id: string }}
   */
  verifyRefreshToken(token) {
    const payload = jwt.verify(token, this.secret);
    if (payload.type !== REFRESH_TOKEN_TYPE) {
      throw new Error('Invalid refresh token.');
    }
    return payload;
  }
}
