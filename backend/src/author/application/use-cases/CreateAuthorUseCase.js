import { Author } from "../../domain/Author.js";

export class CreateAuthorUseCase {
  constructor({ authorRepository }) {
    this.authorRepository = authorRepository;
  }

  async execute(dto) {
    const author = Author.create({ name: dto.name });
    return this.authorRepository.save(author);
  }
}
