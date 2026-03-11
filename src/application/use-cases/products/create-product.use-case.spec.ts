import { CreateProductUseCase } from './create-product.use-case';
import { Product } from '../../../domain/entities/product.entity';
import { ProductRepository } from '../../../domain/repositories/product.repository';

const mockProductRepository: jest.Mocked<ProductRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  search: jest.fn(),
};

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateProductUseCase(mockProductRepository);
  });

  const input = {
    name: 'Widget',
    sku: 'SKU-001',
    picture: '/img/widget.png',
    price: 29.99,
  };

  it('should create and return a product when SKU does not exist', async () => {
    const savedProduct = new Product('abc123', input.name, input.sku, input.picture, input.price);
    mockProductRepository.findBySku.mockResolvedValue(null);
    mockProductRepository.create.mockResolvedValue(savedProduct);

    const result = await useCase.execute(input);

    expect(mockProductRepository.findBySku).toHaveBeenCalledWith(input.sku);
    expect(mockProductRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: null,
        name: input.name,
        sku: input.sku,
        picture: input.picture,
        price: input.price,
      }),
    );
    expect(result).toBe(savedProduct);
  });

  it('should throw when a product with the same SKU already exists', async () => {
    const existing = new Product('existing-id', input.name, input.sku, input.picture, input.price);
    mockProductRepository.findBySku.mockResolvedValue(existing);

    await expect(useCase.execute(input)).rejects.toThrow('Product with this SKU already exists');
    expect(mockProductRepository.create).not.toHaveBeenCalled();
  });

  it('should propagate errors thrown by the repository', async () => {
    mockProductRepository.findBySku.mockRejectedValue(new Error('DB connection failed'));

    await expect(useCase.execute(input)).rejects.toThrow('DB connection failed');
  });
});
