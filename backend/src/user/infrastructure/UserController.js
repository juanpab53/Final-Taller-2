import { RegisterUserRequestDTO } from "../application/dtos/RegisterUserRequestDTO.js";

export class UserController {
  constructor({ registerUserUseCase, getProfileUseCase }) {
    this.registerUserUseCase = registerUserUseCase;
    this.getProfileUseCase = getProfileUseCase;
  }

  async register(req, res, next) {
    try {
      const request = new RegisterUserRequestDTO(req.body);
      const created = await this.registerUserUseCase.execute(request);
      res.status(201).json({ success: true, data: created.toPublic() });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user?.id;
      const profile = await this.getProfileUseCase.execute({ userId });
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
}
