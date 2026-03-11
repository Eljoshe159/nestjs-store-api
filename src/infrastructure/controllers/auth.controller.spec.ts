import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let jwtService: jest.Mocked<JwtService>;

  const mockUserRepository = {
    findByUsername: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: InMemoryUserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should return a success message and accessToken on valid credentials', async () => {
      mockUserRepository.findByUsername.mockResolvedValue({
        id: '1',
        username: 'admin',
        password: 'admin123',
      });
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await controller.login({ username: 'admin', password: 'admin123' });

      expect(result).toEqual({
        message: 'Login successful',
        data: { accessToken: 'jwt-token' },
      });
    });

    it('should throw when credentials are invalid', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      await expect(
        controller.login({ username: 'ghost', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw when password does not match', async () => {
      mockUserRepository.findByUsername.mockResolvedValue({
        id: '1',
        username: 'admin',
        password: 'correct',
      });

      await expect(
        controller.login({ username: 'admin', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials');

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
