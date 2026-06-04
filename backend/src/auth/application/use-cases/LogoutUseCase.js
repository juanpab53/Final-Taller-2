// Logout use case.
export class LogoutUseCase {
	constructor() {}

	async execute() {
		// In this stateless design there is no server-side session state.
		// The controller is responsible for clearing the refresh token cookie.
		return {
			success: true,
			message: 'Logout successful.',
		};
	}
}
