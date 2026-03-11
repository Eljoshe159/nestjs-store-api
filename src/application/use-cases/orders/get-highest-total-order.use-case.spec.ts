import { GetHighestTotalOrderUseCase } from './get-highest-total-order.use-case';
import { Order } from '../../../domain/entities/order.entity';
import { OrderRepository } from '../../../domain/repositories/order.repository';

const mockOrderRepository: jest.Mocked<OrderRepository> = {
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  getTotalSoldLastMonth: jest.fn(),
  getHighestTotalOrder: jest.fn(),
};

describe('GetHighestTotalOrderUseCase', () => {
  let useCase: GetHighestTotalOrderUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetHighestTotalOrderUseCase(mockOrderRepository);
  });

  it('should return the order with the highest total', async () => {
    const order = new Order('o1', 'ORD-001', 'Alice', 999, []);
    mockOrderRepository.getHighestTotalOrder.mockResolvedValue(order);

    const result = await useCase.execute();

    expect(mockOrderRepository.getHighestTotalOrder).toHaveBeenCalledTimes(1);
    expect(result).toBe(order);
  });

  it('should throw when no orders exist', async () => {
    mockOrderRepository.getHighestTotalOrder.mockResolvedValue(null);

    await expect(useCase.execute()).rejects.toThrow('No orders found');
  });

  it('should propagate repository errors', async () => {
    mockOrderRepository.getHighestTotalOrder.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute()).rejects.toThrow('DB error');
  });
});
