import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../../domain/entities/order.entity';
import { Product } from '../../domain/entities/product.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderDocument, OrderModel } from '../database/schemas/order.schema';

export class MongooseOrderRepository implements OrderRepository {
  constructor(
    @InjectModel(OrderModel.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(order: Order): Promise<Order> {
    const createdOrder = new this.orderModel({
      identifier: order.identifier,
      clientName: order.clientName,
      total: order.total,
      products: order.products.map((product) => product.id),
    });

    const savedOrder = await createdOrder.save();
    const populatedOrder = await savedOrder.populate('products');

    return this.toDomain(populatedOrder);
  }

  async update(id: string, order: Partial<Order>): Promise<Order | null> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          ...(order.identifier && { identifier: order.identifier }),
          ...(order.clientName && { clientName: order.clientName }),
          ...(order.total !== undefined && { total: order.total }),
          ...(order.products && {
            products: order.products.map((product) => product.id),
          }),
        },
        { new: true },
      )
      .populate('products')
      .exec();

    if (!updatedOrder) {
      return null;
    }

    return this.toDomain(updatedOrder);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.orderModel.findById(id).populate('products').exec();

    if (!order) {
      return null;
    }

    return this.toDomain(order);
  }

  async getTotalSoldLastMonth(): Promise<number> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: oneMonthAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$total' },
        },
      },
    ]);

    return result[0]?.totalSold || 0;
  }

  async getHighestTotalOrder(): Promise<Order | null> {
    const order = await this.orderModel
      .findOne()
      .sort({ total: -1 })
      .populate('products')
      .exec();

    if (!order) {
      return null;
    }

    return this.toDomain(order);
  }

  private toDomain(order: any): Order {
    const products: Product[] = Array.isArray(order.products)
      ? order.products.map(
          (product: any) =>
            new Product(
              product._id?.toString() || product.id || null,
              product.name || '',
              product.sku || '',
              product.picture || '',
              product.price || 0,
            ),
        )
      : [];

    return new Order(
      order._id.toString(),
      order.identifier,
      order.clientName,
      order.total,
      products,
    );
  }
}