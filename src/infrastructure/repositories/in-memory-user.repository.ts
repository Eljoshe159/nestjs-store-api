import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [
    new User('1', 'admin', 'admin123'),
  ];

  async findByUsername(username: string): Promise<User | null> {
    const user = this.users.find((user) => user.username === username);
    return user || null;
  }
}