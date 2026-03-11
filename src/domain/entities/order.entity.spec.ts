import { Order } from './order.entity';
import { Product } from '../entities/product.entity';

describe('Order', () => {
  const product1 = new Product('p1', 'Widget', 'SKU-001', '/img/widget.png', 10);
  const product2 = new Product('p2', 'Gadget', 'SKU-002', '/img/gadget.png', 20);

  it('should create an order with all properties', () => {
    const order = new Order('o1', 'ORD-001', 'Alice', 30, [product1, product2]);

    expect(order.id).toBe('o1');
    expect(order.identifier).toBe('ORD-001');
    expect(order.clientName).toBe('Alice');
    expect(order.total).toBe(30);
    expect(order.products).toHaveLength(2);
    expect(order.products[0]).toBe(product1);
    expect(order.products[1]).toBe(product2);
  });

  it('should allow null id for unsaved orders', () => {
    const order = new Order(null, 'ORD-002', 'Bob', 10, [product1]);

    expect(order.id).toBeNull();
  });

  it('should store an empty products array', () => {
    const order = new Order('o2', 'ORD-003', 'Charlie', 0, []);

    expect(order.products).toEqual([]);
    expect(order.total).toBe(0);
  });
});
