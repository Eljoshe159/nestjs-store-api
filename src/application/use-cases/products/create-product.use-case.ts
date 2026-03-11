import { Product } from '../../../domain/entities/product.entity';
import { ProductRepository } from '../../../domain/repositories/product.repository';

interface CreateProductInput {
  name: string;
  sku: string;
  picture: string;
  price: number;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const existingProduct = await this.productRepository.findBySku(input.sku);

    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }

    const product = new Product(
      null,
      input.name,
      input.sku,
      input.picture,
      input.price,
    );

    return this.productRepository.create(product);
  }
}