import { Body, Controller, Get, Post, Put, Param } from '@nestjs/common';
import { UpdateOrderUseCase } from '../../application/use-cases/orders/update-order.use-case';
import { CreateOrderUseCase } from '../../application/use-cases/orders/create-order.use-case';
import { GetHighestTotalOrderUseCase } from '../../application/use-cases/orders/get-highest-total-order.use-case';
import { GetTotalSoldLastMonthUseCase } from '../../application/use-cases/orders/get-total-sold-last-month.use-case';
import { MongooseOrderRepository } from '../repositories/mongoose-order.repository';
import { MongooseProductRepository } from '../repositories/mongoose-product.repository';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderRepository: MongooseOrderRepository,
    private readonly productRepository: MongooseProductRepository,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      identifier: string;
      clientName: string;
      productIds: string[];
    },
  ) {
    const useCase = new CreateOrderUseCase(
      this.orderRepository,
      this.productRepository,
    );

    const order = await useCase.execute({
      identifier: body.identifier,
      clientName: body.clientName,
      productIds: body.productIds,
    });

    return {
      message: 'Order created successfully',
      data: order,
    };
  }

  @Get('analytics/total-last-month')
  async getTotalSoldLastMonth() {
    const useCase = new GetTotalSoldLastMonthUseCase(this.orderRepository);
    const total = await useCase.execute();

    return {
      message: 'Total sold in the last month retrieved successfully',
      data: {
        total,
      },
    };
  }

  @Get('analytics/highest-order')
  async getHighestTotalOrder() {
    const useCase = new GetHighestTotalOrderUseCase(this.orderRepository);
    const order = await useCase.execute();

    return {
      message: 'Highest total order retrieved successfully',
      data: order,
    };
  }
    @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      identifier?: string;
      clientName?: string;
      productIds?: string[];
    },
  ) {
    const useCase = new UpdateOrderUseCase(
      this.orderRepository,
      this.productRepository,
    );

    const order = await useCase.execute({
      id,
      identifier: body.identifier,
      clientName: body.clientName,
      productIds: body.productIds,
    });

    return {
      message: 'Order updated successfully',
      data: order,
    };
  }
  
}