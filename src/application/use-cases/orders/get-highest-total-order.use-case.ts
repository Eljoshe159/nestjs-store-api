import { Order } from '../../../domain/entities/order.entity';
import { OrderRepository } from '../../../domain/repositories/order.repository';

export class GetHighestTotalOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<Order> {
    const order = await this.orderRepository.getHighestTotalOrder();

    if (!order) {
      throw new Error('No orders found');
    }

    return order;
  }
}