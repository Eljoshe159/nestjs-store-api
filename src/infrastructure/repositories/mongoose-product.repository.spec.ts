import { MongooseProductRepository } from './mongoose-product.repository';
import { Product } from '../../domain/entities/product.entity';

const mockExec = jest.fn();
const mockLimit = jest.fn(() => ({ exec: mockExec }));
const mockSkip = jest.fn(() => ({ limit: mockLimit }));
const mockSort = jest.fn(() => ({ skip: mockSkip }));
const mockFind = jest.fn(() => ({ sort: mockSort }));
const mockFindById = jest.fn(() => ({ exec: mockExec }));
const mockFindOne = jest.fn(() => ({ exec: mockExec }));
const mockSave = jest.fn();

// Mongoose model constructor mock
function MockProductModel(data: any) {
  Object.assign(this, data);
  this.save = mockSave;
}
MockProductModel.findById = mockFindById;
MockProductModel.findOne = mockFindOne;
MockProductModel.find = mockFind;

describe('MongooseProductRepository', () => {
  let repository: MongooseProductRepository;

  const rawDocument = {
    _id: { toString: () => 'doc-id' },
    name: 'Widget',
    sku: 'SKU-001',
    picture: '/img/widget.png',
    price: 29.99,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MongooseProductRepository(MockProductModel as any);
  });

  describe('create', () => {
    it('should save the product and return a domain entity', async () => {
      mockSave.mockResolvedValue(rawDocument);

      const product = new Product(null, 'Widget', 'SKU-001', '/img/widget.png', 29.99);
      const result = await repository.create(product);

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Product);
      expect(result.id).toBe('doc-id');
      expect(result.name).toBe('Widget');
      expect(result.sku).toBe('SKU-001');
      expect(result.price).toBe(29.99);
    });
  });

  describe('findById', () => {
    it('should return a domain entity when the document is found', async () => {
      mockExec.mockResolvedValue(rawDocument);

      const result = await repository.findById('doc-id');

      expect(mockFindById).toHaveBeenCalledWith('doc-id');
      expect(result).toBeInstanceOf(Product);
      expect(result!.id).toBe('doc-id');
    });

    it('should return null when the document is not found', async () => {
      mockExec.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findBySku', () => {
    it('should return a domain entity when the SKU matches', async () => {
      mockExec.mockResolvedValue(rawDocument);

      const result = await repository.findBySku('SKU-001');

      expect(mockFindOne).toHaveBeenCalledWith({ sku: 'SKU-001' });
      expect(result).toBeInstanceOf(Product);
      expect(result!.sku).toBe('SKU-001');
    });

    it('should return null when no product matches the SKU', async () => {
      mockExec.mockResolvedValue(null);

      const result = await repository.findBySku('UNKNOWN');

      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    const rawDocuments = [
      { _id: { toString: () => '1' }, name: 'Widget A', sku: 'SKU-001', picture: '', price: 10 },
      { _id: { toString: () => '2' }, name: 'Widget B', sku: 'SKU-002', picture: '', price: 20 },
    ];

    it('should return mapped domain entities', async () => {
      mockExec.mockResolvedValue(rawDocuments);

      const result = await repository.search({ page: 1, limit: 10 });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Product);
      expect(result[0].name).toBe('Widget A');
      expect(result[1].name).toBe('Widget B');
    });

    it('should build a name regex filter', async () => {
      mockExec.mockResolvedValue([]);

      await repository.search({ name: 'widget' });

      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({ name: { $regex: 'widget', $options: 'i' } }),
      );
    });

    it('should build a sku exact-match filter', async () => {
      mockExec.mockResolvedValue([]);

      await repository.search({ sku: 'SKU-001' });

      expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ sku: 'SKU-001' }));
    });

    it('should build price range filters', async () => {
      mockExec.mockResolvedValue([]);

      await repository.search({ minPrice: 5, maxPrice: 50 });

      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({ price: { $gte: 5, $lte: 50 } }),
      );
    });

    it('should apply pagination via skip and limit', async () => {
      mockExec.mockResolvedValue([]);

      await repository.search({ page: 3, limit: 5 });

      expect(mockSkip).toHaveBeenCalledWith(10); // (3-1)*5
      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it('should apply sort direction', async () => {
      mockExec.mockResolvedValue([]);

      await repository.search({ sortBy: 'price', sortOrder: 'desc' });

      expect(mockSort).toHaveBeenCalledWith({ price: -1 });
    });

    it('should return an empty array when no documents match', async () => {
      mockExec.mockResolvedValue([]);

      const result = await repository.search({});

      expect(result).toEqual([]);
    });
  });
});
