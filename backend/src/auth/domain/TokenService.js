// Port interface for token generation and verification.
// Concrete implementations must expose the token methods used by the application.
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
