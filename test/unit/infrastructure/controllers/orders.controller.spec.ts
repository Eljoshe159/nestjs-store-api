import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../../../src/infrastructure/controllers/orders.controller';
import { MongooseOrderRepository } from '../../../../src/infrastructure/repositories/mongoose-order.repository';
import { MongooseProductRepository } from '../../../../src/infrastructure/repositories/mongoose-product.repository';
import { Order } from '../../../../src/domain/entities/order.entity';
import { Product } from '../../../../src/domain/entities/product.entity';

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockOrderRepository = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    getTotalSoldLastMonth: jest.fn(),
    getHighestTotalOrder: jest.fn(),
  };

  const mockProductRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findBySku: jest.fn(),
    search: jest.fn(),
  };

  const product = new Product('p1', 'Widget', 'SKU-001', '/img/widget.png', 50);
  const order = new Order('o1', 'ORD-001', 'Alice', 50, [product]);

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: MongooseOrderRepository, useValue: mockOrderRepository },
        { provide: MongooseProductRepository, useValue: mockProductRepository },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  describe('create', () => {
    it('should create an order and return a success response', async () => {
      mockProductRepository.findById.mockResolvedValue(product);
      mockOrderRepository.create.mockResolvedValue(order);

      const result = await controller.create({
        identifier: 'ORD-001',
        clientName: 'Alice',
        productIds: ['p1'],
      });

      expect(result).toEqual({
        message: 'Order created successfully',
        data: order,
      });
    });

    it('should throw when a product in productIds is not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(
        controller.create({ identifier: 'ORD-X', clientName: 'Bob', productIds: ['bad-id'] }),
      ).rejects.toThrow('Product not found: bad-id');

      expect(mockOrderRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getTotalSoldLastMonth', () => {
    it('should return the total sold last month', async () => {
      mockOrderRepository.getTotalSoldLastMonth.mockResolvedValue(1200.5);

      const result = await controller.getTotalSoldLastMonth();

      expect(result).toEqual({
        message: 'Total sold in the last month retrieved successfully',
        data: { total: 1200.5 },
      });
    });

    it('should return zero when no orders exist last month', async () => {
      mockOrderRepository.getTotalSoldLastMonth.mockResolvedValue(0);

      const result = await controller.getTotalSoldLastMonth();

      expect(result.data.total).toBe(0);
    });
  });

  describe('getHighestTotalOrder', () => {
    it('should return the order with the highest total', async () => {
      mockOrderRepository.getHighestTotalOrder.mockResolvedValue(order);

      const result = await controller.getHighestTotalOrder();

      expect(result).toEqual({
        message: 'Highest total order retrieved successfully',
        data: order,
      });
    });

    it('should throw when no orders exist', async () => {
      mockOrderRepository.getHighestTotalOrder.mockResolvedValue(null);

      await expect(controller.getHighestTotalOrder()).rejects.toThrow('No orders found');
    });
  });

  describe('update', () => {
    it('should update an order and return a success response', async () => {
      const updatedOrder = new Order('o1', 'ORD-UPDATED', 'Bob', 50, [product]);
      mockOrderRepository.findById.mockResolvedValue(order);
      mockProductRepository.findById.mockResolvedValue(product);
      mockOrderRepository.update.mockResolvedValue(updatedOrder);

      const result = await controller.update('o1', {
        identifier: 'ORD-UPDATED',
        clientName: 'Bob',
        productIds: ['p1'],
      });

      expect(result).toEqual({
        message: 'Order updated successfully',
        data: updatedOrder,
      });
    });

    it('should throw when the order does not exist', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(
        controller.update('nonexistent', { clientName: 'Bob' }),
      ).rejects.toThrow('Order not found');
    });

    it('should update only provided fields', async () => {
      const updatedOrder = new Order('o1', 'ORD-001', 'New Name', 50, [product]);
      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrder);

      const result = await controller.update('o1', { clientName: 'New Name' });

      expect(result.data).toBe(updatedOrder);
    });
  });
});
