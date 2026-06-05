import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class GetUserProfileUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ userId }) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tel: user.tel,
      role: user.role,
    };
  }
}
