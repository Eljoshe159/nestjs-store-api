import { Product } from './product.entity';

describe('Product', () => {
  it('should create a product with all properties', () => {
    const product = new Product('abc123', 'Widget', 'SKU-001', '/img/widget.png', 29.99);

    expect(product.id).toBe('abc123');
    expect(product.name).toBe('Widget');
    expect(product.sku).toBe('SKU-001');
    expect(product.picture).toBe('/img/widget.png');
    expect(product.price).toBe(29.99);
  });

  it('should allow null id for unsaved products', () => {
    const product = new Product(null, 'Gadget', 'SKU-002', '/img/gadget.png', 9.99);

    expect(product.id).toBeNull();
  });

  it('should store price as zero', () => {
    const product = new Product('1', 'Free Item', 'FREE-001', '', 0);

    expect(product.price).toBe(0);
  });

  it('should store an empty picture path', () => {
    const product = new Product('1', 'No Pic', 'SKU-003', '', 5);

    expect(product.picture).toBe('');
  });
});
