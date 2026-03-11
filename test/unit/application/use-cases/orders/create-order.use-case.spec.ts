import { CreateOrderUseCase } from '../../../../../src/application/use-cases/orders/create-order.use-case';
import { Order } from '../../../../../src/domain/entities/order.entity';
import { Product } from '../../../../../src/domain/entities/product.entity';
import { OrderRepository } from '../../../../../src/domain/repositories/order.repository';
import { ProductRepository } from '../../../../../src/domain/repositories/product.repository';

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

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;

  const product1 = new Product('p1', 'Widget', 'SKU-001', '/img/widget.png', 10);
  const product2 = new Product('p2', 'Gadget', 'SKU-002', '/img/gadget.png', 25);

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateOrderUseCase(mockOrderRepository, mockProductRepository);
  });

  it('should create an order with correct total from product prices', async () => {
    mockProductRepository.findById
      .mockResolvedValueOnce(product1)
      .mockResolvedValueOnce(product2);

    const savedOrder = new Order('o1', 'ORD-001', 'Alice', 35, [product1, product2]);
    mockOrderRepository.create.mockResolvedValue(savedOrder);

    const result = await useCase.execute({
      identifier: 'ORD-001',
      clientName: 'Alice',
      productIds: ['p1', 'p2'],
    });

    expect(mockProductRepository.findById).toHaveBeenCalledTimes(2);
    expect(mockProductRepository.findById).toHaveBeenCalledWith('p1');
    expect(mockProductRepository.findById).toHaveBeenCalledWith('p2');
    expect(mockOrderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: null,
        identifier: 'ORD-001',
        clientName: 'Alice',
        total: 35,
        products: [product1, product2],
      }),
    );
    expect(result).toBe(savedOrder);
  });

  it('should create an order with a single product', async () => {
    mockProductRepository.findById.mockResolvedValueOnce(product1);
    const savedOrder = new Order('o2', 'ORD-002', 'Bob', 10, [product1]);
    mockOrderRepository.create.mockResolvedValue(savedOrder);

    const result = await useCase.execute({
      identifier: 'ORD-002',
      clientName: 'Bob',
      productIds: ['p1'],
    });

    expect(result.total).toBe(10);
    expect(result).toBe(savedOrder);
  });

  it('should throw when a product is not found', async () => {
    mockProductRepository.findById
      .mockResolvedValueOnce(product1)
      .mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ identifier: 'ORD-003', clientName: 'Carol', productIds: ['p1', 'bad-id'] }),
    ).rejects.toThrow('Product not found: bad-id');

    expect(mockOrderRepository.create).not.toHaveBeenCalled();
  });

  it('should calculate total as zero when productIds is empty', async () => {
    const savedOrder = new Order('o3', 'ORD-004', 'Dave', 0, []);
    mockOrderRepository.create.mockResolvedValue(savedOrder);

    const result = await useCase.execute({
      identifier: 'ORD-004',
      clientName: 'Dave',
      productIds: [],
    });

    expect(mockProductRepository.findById).not.toHaveBeenCalled();
    expect(result.total).toBe(0);
  });
});
