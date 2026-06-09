import { CreateBookDTO } from "../application/dtos/CreateBookDTO.js";
import { UpdateBookDTO } from "../application/dtos/UpdateBookDTO.js";

export class BookController {
  constructor({ createBookUseCase, listBooksUseCase, getBookUseCase, updateBookUseCase, deleteBookUseCase }) {
    this.createBookUseCase = createBookUseCase;
    this.listBooksUseCase = listBooksUseCase;
    this.getBookUseCase = getBookUseCase;
    this.updateBookUseCase = updateBookUseCase;
    this.deleteBookUseCase = deleteBookUseCase;
  }

  async create(req, res) {
    const dto = new CreateBookDTO(req.body);
    const book = await this.createBookUseCase.execute(dto);
    res.status(201).json({ success: true, data: book });
  }

  async list(req, res) {
    const { search, categoryId, authorId, page, limit } = req.query;
    const result = await this.listBooksUseCase.execute({ search, categoryId, authorId, page, limit });
    res.json({ success: true, ...result });
  }

  async getById(req, res) {
    const { id } = req.params;
    const book = await this.getBookUseCase.execute({ id });
    res.json({ success: true, data: book });
  }

  async update(req, res) {
    const { id } = req.params;
    const dto = new UpdateBookDTO(req.body);
    const book = await this.updateBookUseCase.execute({ id, dto });
    res.json({ success: true, data: book });
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.deleteBookUseCase.execute({ id });
    res.json({ success: true, data: { message: 'Book deleted successfully.' } });
  }
}
