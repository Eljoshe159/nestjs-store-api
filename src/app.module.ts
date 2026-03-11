import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/store-api'),
    ProductsModule,
    OrdersModule,
    AuthModule,
  ],
})
export class AppModule {}