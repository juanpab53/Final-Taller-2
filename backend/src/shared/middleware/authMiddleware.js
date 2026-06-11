import { UnauthorizedError } from '../errors/UnauthorizedError.js';

export function createAuthMiddleware(tokenService) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedError('Token not provided.');
      }

      const payload = tokenService.verifyAccessToken(token);

      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };

      next();
    } catch (err) {
      if (
        err instanceof UnauthorizedError ||
        err.name === 'JsonWebTokenError' ||
        err.name === 'TokenExpiredError'
      ) {
        return next(new UnauthorizedError('Invalid or expired token.'));
      }

      next(err);
    }
  };
}
