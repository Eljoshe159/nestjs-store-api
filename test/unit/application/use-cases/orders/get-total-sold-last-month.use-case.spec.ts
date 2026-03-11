import { GetTotalSoldLastMonthUseCase } from '../../../../../src/application/use-cases/orders/get-total-sold-last-month.use-case';
import { OrderRepository } from '../../../../../src/domain/repositories/order.repository';

const mockOrderRepository: jest.Mocked<OrderRepository> = {
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  getTotalSoldLastMonth: jest.fn(),
  getHighestTotalOrder: jest.fn(),
};

describe('GetTotalSoldLastMonthUseCase', () => {
  let useCase: GetTotalSoldLastMonthUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetTotalSoldLastMonthUseCase(mockOrderRepository);
  });

  it('should return the total sold value from the repository', async () => {
    mockOrderRepository.getTotalSoldLastMonth.mockResolvedValue(1500.5);

    const result = await useCase.execute();

    expect(mockOrderRepository.getTotalSoldLastMonth).toHaveBeenCalledTimes(1);
    expect(result).toBe(1500.5);
  });

  it('should return zero when no orders exist in the last month', async () => {
    mockOrderRepository.getTotalSoldLastMonth.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(result).toBe(0);
  });

  it('should propagate repository errors', async () => {
    mockOrderRepository.getTotalSoldLastMonth.mockRejectedValue(new Error('Aggregation failed'));

    await expect(useCase.execute()).rejects.toThrow('Aggregation failed');
  });
});
