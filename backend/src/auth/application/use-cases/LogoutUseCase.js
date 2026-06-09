export class LogoutUseCase {
  constructor() {}

  async execute() {
    return {
      success: true,
      message: 'Logout successful.',
    };
  }
}
