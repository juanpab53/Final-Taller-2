export class ListAuthorsUseCase {
  constructor({ authorRepository }) {
    this.authorRepository = authorRepository;
  }

  async execute({ name } = {}) {
    if (name) {
      return this.authorRepository.findByName(name);
    }
    return this.authorRepository.findAll();
  }
}
