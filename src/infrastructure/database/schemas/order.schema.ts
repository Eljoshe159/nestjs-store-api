import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<OrderModel>;

@Schema({ timestamps: true })
export class OrderModel {
  @Prop({ required: true, unique: true })
  identifier: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  total: number;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'ProductModel' }],
    required: true,
  })
  products: Types.ObjectId[];
}

export const OrderSchema = SchemaFactory.createForClass(OrderModel);