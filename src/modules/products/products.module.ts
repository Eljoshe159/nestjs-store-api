import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModel, ProductSchema } from '../../infrastructure/database/schemas/product.schema';
import { ProductsController } from '../../infrastructure/controllers/products.controller';
import { MongooseProductRepository } from '../../infrastructure/repositories/mongoose-product.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductModel.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [MongooseProductRepository],
  exports: [MongooseProductRepository],
})
export class ProductsModule {}