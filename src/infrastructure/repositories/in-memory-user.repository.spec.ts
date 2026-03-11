import { InMemoryUserRepository } from './in-memory-user.repository';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('should return the admin user when username matches', async () => {
    const user = await repository.findByUsername('admin');

    expect(user).not.toBeNull();
    expect(user!.username).toBe('admin');
    expect(user!.password).toBe('admin123');
    expect(user!.id).toBe('1');
  });

  it('should return null when the username does not exist', async () => {
    const user = await repository.findByUsername('unknown');

    expect(user).toBeNull();
  });

  it('should be case-sensitive for username lookup', async () => {
    const user = await repository.findByUsername('Admin');

    expect(user).toBeNull();
  });

  it('should return null for an empty string username', async () => {
    const user = await repository.findByUsername('');

    expect(user).toBeNull();
  });
});
