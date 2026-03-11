import { MongooseOrderRepository } from './mongoose-order.repository';
import { Order } from '../../domain/entities/order.entity';
import { Product } from '../../domain/entities/product.entity';

const mockExec = jest.fn();
const mockPopulateExec = jest.fn();
const mockPopulate = jest.fn(() => ({ exec: mockPopulateExec }));
const mockFindById = jest.fn(() => ({ populate: mockPopulate }));
const mockFindOne = jest.fn(() => ({ sort: mockSortPopulate }));
const mockSortPopulate = jest.fn(() => ({ populate: mockPopulate }));
const mockFindByIdAndUpdate = jest.fn(() => ({ populate: mockPopulate }));
const mockAggregate = jest.fn();
const mockSave = jest.fn();
const mockSavePopulate = jest.fn();

function MockOrderModel(data: any) {
  Object.assign(this, data);
  this.save = mockSave;
}
MockOrderModel.findById = mockFindById;
MockOrderModel.findOne = mockFindOne;
MockOrderModel.findByIdAndUpdate = mockFindByIdAndUpdate;
MockOrderModel.aggregate = mockAggregate;

describe('MongooseOrderRepository', () => {
  let repository: MongooseOrderRepository;

  const rawProduct = {
    _id: { toString: () => 'p1' },
    name: 'Widget',
    sku: 'SKU-001',
    picture: '/img/widget.png',
    price: 10,
  };

  const rawOrder = {
    _id: { toString: () => 'o1' },
    identifier: 'ORD-001',
    clientName: 'Alice',
    total: 10,
    products: [rawProduct],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MongooseOrderRepository(MockOrderModel as any);
  });

  describe('create', () => {
    it('should save the order and return a domain entity with populated products', async () => {
      const savedDoc = { ...rawOrder, populate: jest.fn().mockResolvedValue(rawOrder) };
      mockSave.mockResolvedValue(savedDoc);

      const product = new Product('p1', 'Widget', 'SKU-001', '/img/widget.png', 10);
      const order = new Order(null, 'ORD-001', 'Alice', 10, [product]);

      const result = await repository.create(order);

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Order);
      expect(result.id).toBe('o1');
      expect(result.identifier).toBe('ORD-001');
      expect(result.clientName).toBe('Alice');
      expect(result.total).toBe(10);
      expect(result.products).toHaveLength(1);
      expect(result.products[0]).toBeInstanceOf(Product);
    });
  });

  describe('findById', () => {
    it('should return a domain entity when the order is found', async () => {
      mockPopulateExec.mockResolvedValue(rawOrder);

      const result = await repository.findById('o1');

      expect(mockFindById).toHaveBeenCalledWith('o1');
      expect(result).toBeInstanceOf(Order);
      expect(result!.id).toBe('o1');
      expect(result!.products[0].name).toBe('Widget');
    });

    it('should return null when the order is not found', async () => {
      mockPopulateExec.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update the order and return the updated domain entity', async () => {
      const updatedRaw = { ...rawOrder, clientName: 'Bob', _id: { toString: () => 'o1' } };
      mockPopulateExec.mockResolvedValue(updatedRaw);

      const product = new Product('p1', 'Widget', 'SKU-001', '', 10);
      const result = await repository.update('o1', { clientName: 'Bob', products: [product] });

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        'o1',
        expect.any(Object),
        { new: true },
      );
      expect(result).toBeInstanceOf(Order);
    });

    it('should return null when the order to update is not found', async () => {
      mockPopulateExec.mockResolvedValue(null);

      const result = await repository.update('nonexistent', { clientName: 'Bob' });

      expect(result).toBeNull();
    });
  });

  describe('getTotalSoldLastMonth', () => {
    it('should return the aggregated total', async () => {
      mockAggregate.mockResolvedValue([{ totalSold: 500 }]);

      const result = await repository.getTotalSoldLastMonth();

      expect(mockAggregate).toHaveBeenCalledTimes(1);
      expect(result).toBe(500);
    });

    it('should return 0 when the aggregation result is empty', async () => {
      mockAggregate.mockResolvedValue([]);

      const result = await repository.getTotalSoldLastMonth();

      expect(result).toBe(0);
    });
  });

  describe('getHighestTotalOrder', () => {
    it('should return the order with the highest total', async () => {
      mockPopulateExec.mockResolvedValue(rawOrder);

      const result = await repository.getHighestTotalOrder();

      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Order);
      expect(result!.total).toBe(10);
    });

    it('should return null when no orders exist', async () => {
      mockPopulateExec.mockResolvedValue(null);

      const result = await repository.getHighestTotalOrder();

      expect(result).toBeNull();
    });
  });
});
