import { LoginUseCase } from '../../../../../src/application/use-cases/auth/login.use-case';
import { User } from '../../../../../src/domain/entities/user.entity';
import { UserRepository } from '../../../../../src/domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';

const mockUserRepository: jest.Mocked<UserRepository> = {
  findByUsername: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
} as unknown as jest.Mocked<JwtService>;

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockUserRepository, mockJwtService);
  });

  it('should return an accessToken when credentials are valid', async () => {
    const user = new User('u1', 'admin', 'admin123');
    mockUserRepository.findByUsername.mockResolvedValue(user);
    mockJwtService.signAsync.mockResolvedValue('signed.jwt.token');

    const result = await useCase.execute({ username: 'admin', password: 'admin123' });

    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('admin');
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: 'u1', username: 'admin' });
    expect(result).toEqual({ accessToken: 'signed.jwt.token' });
  });

  it('should throw when the user does not exist', async () => {
    mockUserRepository.findByUsername.mockResolvedValue(null);

    await expect(useCase.execute({ username: 'ghost', password: 'anything' })).rejects.toThrow(
      'Invalid credentials',
    );
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should throw when the password does not match', async () => {
    const user = new User('u1', 'admin', 'correct-password');
    mockUserRepository.findByUsername.mockResolvedValue(user);

    await expect(useCase.execute({ username: 'admin', password: 'wrong-password' })).rejects.toThrow(
      'Invalid credentials',
    );
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should propagate jwtService errors', async () => {
    const user = new User('u1', 'admin', 'admin123');
    mockUserRepository.findByUsername.mockResolvedValue(user);
    mockJwtService.signAsync.mockRejectedValue(new Error('JWT signing failed'));

    await expect(useCase.execute({ username: 'admin', password: 'admin123' })).rejects.toThrow(
      'JWT signing failed',
    );
  });
});
