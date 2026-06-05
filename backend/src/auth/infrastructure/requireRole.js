import { UnauthorizedError } from '../../shared/errors/UnauthorizedError.js';
import { ForbiddenError } from '../../shared/errors/ForbiddenError.js';

export function requireRole(...roles) {
	return (req, res, next) => {
		if (!req.user) {
			return next(new UnauthorizedError('Not authenticated.'));
		}

		if (!roles.includes(req.user.role)) {
			return next(new ForbiddenError(
				`Access denied. Required role: ${roles.join(' or ')}.`
			));
		}

		next();
	};
}
