import { Order } from '../../../domain/entities/order.entity';
import { Product } from '../../../domain/entities/product.entity';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { ProductRepository } from '../../../domain/repositories/product.repository';

interface UpdateOrderInput {
  id: string;
  identifier?: string;
  clientName?: string;
  productIds?: string[];
}

export class UpdateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: UpdateOrderInput): Promise<Order> {
    const existingOrder = await this.orderRepository.findById(input.id);

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    let products = existingOrder.products;
    let total = existingOrder.total;

    if (input.productIds) {
      const resolvedProducts: Product[] = [];

      for (const productId of input.productIds) {
        const product = await this.productRepository.findById(productId);

        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }

        resolvedProducts.push(product);
      }

      products = resolvedProducts;
      total = resolvedProducts.reduce((sum, product) => sum + product.price, 0);
    }

    const updatedOrder = await this.orderRepository.update(input.id, {
      identifier: input.identifier ?? existingOrder.identifier,
      clientName: input.clientName ?? existingOrder.clientName,
      total,
      products,
    });

    if (!updatedOrder) {
      throw new Error('Order not found');
    }

    return updatedOrder;
  }
}