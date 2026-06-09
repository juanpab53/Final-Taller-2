import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class GetAuthorUseCase {
  constructor({ authorRepository }) {
    this.authorRepository = authorRepository;
  }

  async execute({ id }) {
    const author = await this.authorRepository.findById(id);
    if (!author) throw new NotFoundError('Author not found.');
    return author;
  }
}
