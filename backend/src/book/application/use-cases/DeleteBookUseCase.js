export class DeleteBookUseCase {
  constructor({ bookRepository }) {
    this.bookRepository = bookRepository;
  }

  async execute({ id }) {
    await this.bookRepository.delete(id);
  }
}
