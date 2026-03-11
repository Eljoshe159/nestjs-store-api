import { OrderRepository } from '../../../domain/repositories/order.repository';

export class GetTotalSoldLastMonthUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<number> {
    return this.orderRepository.getTotalSoldLastMonth();
  }
}