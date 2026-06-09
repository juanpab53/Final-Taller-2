import { RegisterUserRequestDTO } from "../application/dtos/RegisterUserRequestDTO.js";

export class UserController {
  constructor({ registerUserUseCase, getProfileUseCase }) {
    this.registerUserUseCase = registerUserUseCase;
    this.getProfileUseCase = getProfileUseCase;
  }

  async register(req, res) {
    const request = new RegisterUserRequestDTO(req.body);
    const created = await this.registerUserUseCase.execute(request);
    res.status(201).json({ success: true, data: created });
  }

  async getProfile(req, res) {
    const userId = req.user?.id;
    const profile = await this.getProfileUseCase.execute({ userId });
    res.json({ success: true, data: profile });
  }
}
