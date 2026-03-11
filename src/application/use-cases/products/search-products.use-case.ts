import {
  ProductFilters,
  ProductRepository,
} from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';

export class SearchProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(filters: ProductFilters): Promise<Product[]> {
    return this.productRepository.search(filters);
  }
}