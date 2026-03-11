import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { MongooseProductRepository } from '../repositories/mongoose-product.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Product } from '../../domain/entities/product.entity';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findBySku: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: MongooseProductRepository, useValue: mockProductRepository },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('create', () => {
    it('should create a product and return a success response', async () => {
      const savedProduct = new Product('abc', 'Widget', 'SKU-001', '/uploads/img.png', 29.99);
      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(savedProduct);

      const file = { filename: 'img.png' } as Express.Multer.File;
      const body = { name: 'Widget', sku: 'SKU-001', price: '29.99' };

      const result = await controller.create(file, body);

      expect(result).toEqual({
        message: 'Product created successfully',
        data: savedProduct,
      });
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Widget', sku: 'SKU-001', price: 29.99 }),
      );
    });

    it('should use an empty picture path when no file is uploaded', async () => {
      const savedProduct = new Product('abc', 'Widget', 'SKU-001', '', 10);
      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(savedProduct);

      await controller.create(undefined as any, { name: 'Widget', sku: 'SKU-001', price: '10' });

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ picture: '' }),
      );
    });

    it('should throw when SKU already exists', async () => {
      const existing = new Product('old', 'Widget', 'SKU-001', '', 10);
      mockProductRepository.findBySku.mockResolvedValue(existing);

      await expect(
        controller.create({ filename: 'f.png' } as Express.Multer.File, {
          name: 'Widget',
          sku: 'SKU-001',
          price: '10',
        }),
      ).rejects.toThrow('Product with this SKU already exists');
    });
  });

  describe('findById', () => {
    it('should return the product when found', async () => {
      const product = new Product('abc', 'Widget', 'SKU-001', '/img.png', 29.99);
      mockProductRepository.findById.mockResolvedValue(product);

      const result = await controller.findById('abc');

      expect(result).toEqual({
        message: 'Product retrieved successfully',
        data: product,
      });
      expect(mockProductRepository.findById).toHaveBeenCalledWith('abc');
    });

    it('should throw when the product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(controller.findById('nonexistent')).rejects.toThrow('Product not found');
    });
  });

  describe('search', () => {
    it('should return products with default pagination', async () => {
      const products = [new Product('1', 'Widget', 'SKU-001', '', 10)];
      mockProductRepository.search.mockResolvedValue(products);

      const result = await controller.search();

      expect(result).toEqual({
        message: 'Products retrieved successfully',
        data: products,
      });
      expect(mockProductRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10, sortBy: 'name', sortOrder: 'asc' }),
      );
    });

    it('should pass query filters to the use case', async () => {
      mockProductRepository.search.mockResolvedValue([]);

      await controller.search('widget', 'SKU-001', '5', '100', '2', '5', 'price', 'desc');

      expect(mockProductRepository.search).toHaveBeenCalledWith({
        name: 'widget',
        sku: 'SKU-001',
        minPrice: 5,
        maxPrice: 100,
        page: 2,
        limit: 5,
        sortBy: 'price',
        sortOrder: 'desc',
      });
    });

    it('should return an empty array when no products match', async () => {
      mockProductRepository.search.mockResolvedValue([]);

      const result = await controller.search('nonexistent');

      expect(result.data).toEqual([]);
    });
  });
});
