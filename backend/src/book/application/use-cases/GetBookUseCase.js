import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class GetBookUseCase {
  constructor({ bookRepository }) {
    this.bookRepository = bookRepository;
  }

  async execute({ id }) {
    const book = await this.bookRepository.findById(id);
    if (!book) throw new NotFoundError('Book not found.');
    return book;
  }
}
