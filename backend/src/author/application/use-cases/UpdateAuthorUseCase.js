export class UpdateAuthorUseCase {
  constructor({ authorRepository }) {
    this.authorRepository = authorRepository;
  }

  async execute({ id, dto }) {
    return this.authorRepository.update(id, { name: dto.name });
  }
}
