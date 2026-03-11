import { Order } from '../entities/order.entity';

export interface OrderRepository {
  create(order: Order): Promise<Order>;
  update(id: string, order: Partial<Order>): Promise<Order | null>;
  findById(id: string): Promise<Order | null>;
  getTotalSoldLastMonth(): Promise<number>;
  getHighestTotalOrder(): Promise<Order | null>;
}