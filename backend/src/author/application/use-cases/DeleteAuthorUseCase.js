export class DeleteAuthorUseCase {
  constructor({ authorRepository }) {
    this.authorRepository = authorRepository;
  }

  async execute({ id }) {
    await this.authorRepository.delete(id);
  }
}
