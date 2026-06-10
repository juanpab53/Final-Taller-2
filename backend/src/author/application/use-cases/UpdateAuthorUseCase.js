export class UpdateAuthorUseCase {
  constructor({ authorRepository }) {
    this.authorRepository = authorRepository;
  }

  async execute({ id, dto }) {
    const data = {};
    if (dto.name !== undefined) data.name = dto.name;
    return this.authorRepository.update(id, data);
  }
}
