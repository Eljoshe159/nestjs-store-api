import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepository: InMemoryUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(
    @Body()
    body: {
      username: string;
      password: string;
    },
  ) {
    const useCase = new LoginUseCase(this.userRepository, this.jwtService);

    const result = await useCase.execute({
      username: body.username,
      password: body.password,
    });

    return {
      message: 'Login successful',
      data: result,
    };
  }
}