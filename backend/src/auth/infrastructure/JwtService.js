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
      throw new Error('JWT_SECRET no definido en el entorno');
    }
  }

  /**
   * Firma un access token corto.
   * @param {{ id: string, email: string, role: string }} payload
   * @returns {string}
   */
  signAccessToken(payload) {
    return jwt.sign({ ...payload, type: ACCESS_TOKEN_TYPE }, this.secret, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
  }

  /**
   * Firma un refresh token de larga duración.
   * @param {{ id: string }} payload
   * @returns {string}
   */
  signRefreshToken(payload) {
    return jwt.sign({ ...payload, type: REFRESH_TOKEN_TYPE }, this.secret, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });
  }

  /**
   * Verifica y decodifica un access token.
   * @param {string} token
   * @returns {{ id: string, email: string, role: string }}
   */
  verifyAccessToken(token) {
    const payload = jwt.verify(token, this.secret);
    if (payload.type !== ACCESS_TOKEN_TYPE) {
      throw new Error('Token inválido.');
    }
    return payload;
  }

  /**
   * Verifica y decodifica un refresh token.
   * @param {string} token
   * @returns {{ id: string }}
   */
  verifyRefreshToken(token) {
    const payload = jwt.verify(token, this.secret);
    if (payload.type !== REFRESH_TOKEN_TYPE) {
      throw new Error('Refresh token inválido.');
    }
    return payload;
  }
}
