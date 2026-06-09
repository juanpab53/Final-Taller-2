import { NotFoundError } from "../../../shared/errors/NotFoundError.js";

export class GetCategoryUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute({ id }) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category not found.');
    return category;
  }
}
