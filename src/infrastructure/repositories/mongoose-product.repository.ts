import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../domain/entities/product.entity';
import {
  ProductFilters,
  ProductRepository,
} from '../../domain/repositories/product.repository';
import {
  ProductDocument,
  ProductModel,
} from '../database/schemas/product.schema';

export class MongooseProductRepository implements ProductRepository {
  constructor(
    @InjectModel(ProductModel.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(product: Product): Promise<Product> {
    const createdProduct = new this.productModel({
      name: product.name,
      sku: product.sku,
      picture: product.picture,
      price: product.price,
    });

    const savedProduct = await createdProduct.save();

    return this.toDomain(savedProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      return null;
    }

    return this.toDomain(product);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await this.productModel.findOne({ sku }).exec();

    if (!product) {
      return null;
    }

    return this.toDomain(product);
  }

    async search(filters: ProductFilters): Promise<Product[]> {
    const {
      name,
      sku,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters;

    const query: any = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (sku) {
      query.sku = sku;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        query.price.$lte = maxPrice;
      }
    }

    const products = await this.productModel
      .find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return products.map((product) => this.toDomain(product));
  }

  private toDomain(product: ProductDocument): Product {
    return new Product(
      product._id.toString(),
      product.name,
      product.sku,
      product.picture,
      product.price,
    );
  }
}