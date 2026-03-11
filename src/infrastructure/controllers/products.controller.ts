import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateProductUseCase } from '../../application/use-cases/products/create-product.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/products/get-product-by-id.use-case';
import { SearchProductsUseCase } from '../../application/use-cases/products/search-products.use-case';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MongooseProductRepository } from '../repositories/mongoose-product.repository';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productRepository: MongooseProductRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      name: string;
      sku: string;
      price: string;
    },
  ) {
    const useCase = new CreateProductUseCase(this.productRepository);

    const product = await useCase.execute({
      name: body.name,
      sku: body.sku,
      picture: file ? `/uploads/${file.filename}` : '',
      price: Number(body.price),
    });

    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    const useCase = new GetProductByIdUseCase(this.productRepository);
    const product = await useCase.execute(id);

    return {
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  @Get()
  async search(
    @Query('name') name?: string,
    @Query('sku') sku?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const useCase = new SearchProductsUseCase(this.productRepository);

    const products = await useCase.execute({
      name,
      sku,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy || 'name',
      sortOrder: sortOrder || 'asc',
    });

    return {
      message: 'Products retrieved successfully',
      data: products,
    };
  }
}