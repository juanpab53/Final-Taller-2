import { CreateAuthorDTO } from "../application/dtos/CreateAuthorDTO.js";
import { UpdateAuthorDTO } from "../application/dtos/UpdateAuthorDTO.js";

export class AuthorController {
  constructor({ createAuthorUseCase, listAuthorsUseCase, getAuthorUseCase, updateAuthorUseCase, deleteAuthorUseCase }) {
    this.createAuthorUseCase = createAuthorUseCase;
    this.listAuthorsUseCase = listAuthorsUseCase;
    this.getAuthorUseCase = getAuthorUseCase;
    this.updateAuthorUseCase = updateAuthorUseCase;
    this.deleteAuthorUseCase = deleteAuthorUseCase;
  }

  async create(req, res) {
    const dto = new CreateAuthorDTO(req.body);
    const author = await this.createAuthorUseCase.execute(dto);
    res.status(201).json({ success: true, data: author });
  }

  async list(req, res) {
    const { name } = req.query;
    const authors = await this.listAuthorsUseCase.execute({ name });
    res.json({ success: true, data: authors });
  }

  async getById(req, res) {
    const { id } = req.params;
    const author = await this.getAuthorUseCase.execute({ id });
    res.json({ success: true, data: author });
  }

  async update(req, res) {
    const { id } = req.params;
    const dto = new UpdateAuthorDTO(req.body);
    const author = await this.updateAuthorUseCase.execute({ id, dto });
    res.json({ success: true, data: author });
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.deleteAuthorUseCase.execute({ id });
    res.json({ success: true, data: { message: 'Author deleted successfully.' } });
  }
}
