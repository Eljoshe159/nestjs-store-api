import { GetProductByIdUseCase } from '../../../../../src/application/use-cases/products/get-product-by-id.use-case';
import { Product } from '../../../../../src/domain/entities/product.entity';
import { ProductRepository } from '../../../../../src/domain/repositories/product.repository';

const mockProductRepository: jest.Mocked<ProductRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  search: jest.fn(),
};

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetProductByIdUseCase(mockProductRepository);
  });

  it('should return the product when found', async () => {
    const product = new Product('abc123', 'Widget', 'SKU-001', '/img/widget.png', 29.99);
    mockProductRepository.findById.mockResolvedValue(product);

    const result = await useCase.execute('abc123');

    expect(mockProductRepository.findById).toHaveBeenCalledWith('abc123');
    expect(result).toBe(product);
  });

  it('should throw when the product is not found', async () => {
    mockProductRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow('Product not found');
  });

  it('should propagate repository errors', async () => {
    mockProductRepository.findById.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute('abc123')).rejects.toThrow('DB error');
  });
});
