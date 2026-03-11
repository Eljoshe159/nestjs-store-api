export class Product {
  constructor(
    public readonly id: string | null,
    public readonly name: string,
    public readonly sku: string,
    public readonly picture: string,
    public readonly price: number,
  ) {}
}