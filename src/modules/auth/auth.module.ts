import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../../infrastructure/controllers/auth.controller';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'super_secret_jwt_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [InMemoryUserRepository, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}