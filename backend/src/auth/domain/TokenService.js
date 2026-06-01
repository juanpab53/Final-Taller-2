// Port interface for token generation and verification.
// Implementaciones concretas deben exponer los métodos de token usados por la aplicación.
export class TokenService {
  signAccessToken(payload) {
    throw new Error("TokenService.signAccessToken must be implemented.");
  }

  signRefreshToken(payload) {
    throw new Error("TokenService.signRefreshToken must be implemented.");
  }

  verifyAccessToken(token) {
    throw new Error("TokenService.verifyAccessToken must be implemented.");
  }

  verifyRefreshToken(token) {
    throw new Error("TokenService.verifyRefreshToken must be implemented.");
  }
}
