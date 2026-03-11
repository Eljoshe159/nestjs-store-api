import { Product } from './product.entity';

export class Order {
  constructor(
    public readonly id: string | null,
    public readonly identifier: string,
    public readonly clientName: string,
    public readonly total: number,
    public readonly products: Product[],
  ) {}
}