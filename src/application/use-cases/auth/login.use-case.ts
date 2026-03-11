import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../domain/repositories/user.repository';

interface LoginInput {
  username: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findByUsername(input.username);

    if (!user || user.password !== input.password) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}