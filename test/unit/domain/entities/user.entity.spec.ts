import { User } from '../../../../src/domain/entities/user.entity';

describe('User', () => {
  it('should create a user with all properties', () => {
    const user = new User('u1', 'admin', 'secret');

    expect(user.id).toBe('u1');
    expect(user.username).toBe('admin');
    expect(user.password).toBe('secret');
  });

  it('should allow null id for unsaved users', () => {
    const user = new User(null, 'guest', 'pass');

    expect(user.id).toBeNull();
  });
});
