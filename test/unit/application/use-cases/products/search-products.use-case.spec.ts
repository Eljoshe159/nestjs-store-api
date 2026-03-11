import { SearchProductsUseCase } from '../../../../../src/application/use-cases/products/search-products.use-case';
import { Product } from '../../../../../src/domain/entities/product.entity';
import { ProductFilters, ProductRepository } from '../../../../../src/domain/repositories/product.repository';

const mockProductRepository: jest.Mocked<ProductRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySku: jest.fn(),
  search: jest.fn(),
};

describe('SearchProductsUseCase', () => {
  let useCase: SearchProductsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SearchProductsUseCase(mockProductRepository);
  });

  it('should return products matching the filters', async () => {
    const products = [
      new Product('1', 'Widget', 'SKU-001', '/img/widget.png', 10),
      new Product('2', 'Widgeta', 'SKU-002', '/img/widgeta.png', 20),
    ];
    const filters: ProductFilters = { name: 'widget', page: 1, limit: 10 };
    mockProductRepository.search.mockResolvedValue(products);

    const result = await useCase.execute(filters);

    expect(mockProductRepository.search).toHaveBeenCalledWith(filters);
    expect(result).toBe(products);
  });

  it('should return an empty array when no products match', async () => {
    mockProductRepository.search.mockResolvedValue([]);

    const result = await useCase.execute({ name: 'nonexistent' });

    expect(result).toEqual([]);
  });

  it('should pass all filter options to the repository', async () => {
    mockProductRepository.search.mockResolvedValue([]);
    const filters: ProductFilters = {
      name: 'item',
      sku: 'SKU-X',
      minPrice: 5,
      maxPrice: 100,
      page: 2,
      limit: 5,
      sortBy: 'price',
      sortOrder: 'desc',
    };

    await useCase.execute(filters);

    expect(mockProductRepository.search).toHaveBeenCalledWith(filters);
  });
});
