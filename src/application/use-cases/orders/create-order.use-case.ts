import { Order } from '../../../domain/entities/order.entity';
import { Product } from '../../../domain/entities/product.entity';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { ProductRepository } from '../../../domain/repositories/product.repository';

interface CreateOrderInput {
  identifier: string;
  clientName: string;
  productIds: string[];
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const products: Product[] = [];

    for (const productId of input.productIds) {
      const product = await this.productRepository.findById(productId);

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      products.push(product);
    }

    const total = products.reduce((sum, product) => sum + product.price, 0);

    const order = new Order(
      null,
      input.identifier,
      input.clientName,
      total,
      products,
    );

    return this.orderRepository.create(order);
  }
}