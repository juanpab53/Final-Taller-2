import { Category } from "../../domain/Category.js";

export class CreateCategoryUseCase {
  constructor({ categoryRepository }) {
    this.categoryRepository = categoryRepository;
  }

  async execute(dto) {
    const category = Category.create({ name: dto.name });
    return this.categoryRepository.save(category);
  }
}
