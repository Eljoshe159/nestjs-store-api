import { Product } from '../../../domain/entities/product.entity';
import { ProductRepository } from '../../../domain/repositories/product.repository';

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }
}