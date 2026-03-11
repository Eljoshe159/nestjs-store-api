import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<ProductModel>;

@Schema({ timestamps: true })
export class ProductModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true })
  picture: string;

  @Prop({ required: true })
  price: number;
}

export const ProductSchema = SchemaFactory.createForClass(ProductModel);