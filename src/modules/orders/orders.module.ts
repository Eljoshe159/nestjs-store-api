import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from '../../infrastructure/controllers/orders.controller';
import { OrderModel, OrderSchema } from '../../infrastructure/database/schemas/order.schema';
import { ProductModel, ProductSchema } from '../../infrastructure/database/schemas/product.schema';
import { MongooseOrderRepository } from '../../infrastructure/repositories/mongoose-order.repository';
import { MongooseProductRepository } from '../../infrastructure/repositories/mongoose-product.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderModel.name, schema: OrderSchema },
      { name: ProductModel.name, schema: ProductSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [MongooseOrderRepository, MongooseProductRepository],
  exports: [MongooseOrderRepository],
})
export class OrdersModule {}