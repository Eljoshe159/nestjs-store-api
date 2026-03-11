import { UpdateOrderUseCase } from './update-order.use-case';
import { Order } from '../../../domain/entities/order.entity';
import { Product } from '../../../domain/entities/product.entity';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { ProductRepository } from '../../../domain/repositories/product.repository';

const mockOrderRepository: jest.Mocked<OrderRepository> = {
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  getTotalSoldLastMonth: jest.fn(),
  getHighestTotalOrder: jest.fn(),
};

const mockProductRepository: jest.Mocked<ProductRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  search: jest.fn(),
};

describe('UpdateOrderUseCase', () => {
  let useCase: UpdateOrderUseCase;

  const product1 = new Product('p1', 'Widget', 'SKU-001', '/img/widget.png', 10);
  const product2 = new Product('p2', 'Gadget', 'SKU-002', '/img/gadget.png', 25);
  const existingOrder = new Order('o1', 'ORD-001', 'Alice', 10, [product1]);

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateOrderUseCase(mockOrderRepository, mockProductRepository);
  });

  it('should update the order with new products and recalculate total', async () => {
    const updatedOrder = new Order('o1', 'ORD-001', 'Alice', 35, [product1, product2]);
    mockOrderRepository.findById.mockResolvedValue(existingOrder);
    mockProductRepository.findById
      .mockResolvedValueOnce(product1)
      .mockResolvedValueOnce(product2);
    mockOrderRepository.update.mockResolvedValue(updatedOrder);

    const result = await useCase.execute({
      id: 'o1',
      productIds: ['p1', 'p2'],
    });

    expect(mockOrderRepository.update).toHaveBeenCalledWith(
      'o1',
      expect.objectContaining({ total: 35, products: [product1, product2] }),
    );
    expect(result).toBe(updatedOrder);
  });

  it('should update identifier and clientName without changing products', async () => {
    const updatedOrder = new Order('o1', 'ORD-UPDATED', 'Bob', 10, [product1]);
    mockOrderRepository.findById.mockResolvedValue(existingOrder);
    mockOrderRepository.update.mockResolvedValue(updatedOrder);

    const result = await useCase.execute({
      id: 'o1',
      identifier: 'ORD-UPDATED',
      clientName: 'Bob',
    });

    expect(mockProductRepository.findById).not.toHaveBeenCalled();
    expect(mockOrderRepository.update).toHaveBeenCalledWith(
      'o1',
      expect.objectContaining({
        identifier: 'ORD-UPDATED',
        clientName: 'Bob',
        total: existingOrder.total,
        products: existingOrder.products,
      }),
    );
    expect(result).toBe(updatedOrder);
  });

  it('should throw when the order to update is not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'nonexistent' })).rejects.toThrow('Order not found');
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
  });

  it('should throw when a product in the new productIds is not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(existingOrder);
    mockProductRepository.findById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ id: 'o1', productIds: ['bad-id'] }),
    ).rejects.toThrow('Product not found: bad-id');

    expect(mockOrderRepository.update).not.toHaveBeenCalled();
  });

  it('should throw when the repository update returns null', async () => {
    mockOrderRepository.findById.mockResolvedValue(existingOrder);
    mockOrderRepository.update.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'o1' })).rejects.toThrow('Order not found');
  });

  it('should keep existing identifier and clientName when not provided', async () => {
    const updatedOrder = new Order('o1', 'ORD-001', 'Alice', 10, [product1]);
    mockOrderRepository.findById.mockResolvedValue(existingOrder);
    mockOrderRepository.update.mockResolvedValue(updatedOrder);

    await useCase.execute({ id: 'o1' });

    expect(mockOrderRepository.update).toHaveBeenCalledWith(
      'o1',
      expect.objectContaining({
        identifier: existingOrder.identifier,
        clientName: existingOrder.clientName,
      }),
    );
  });
});
