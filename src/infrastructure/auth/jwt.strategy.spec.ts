jest.mock('@nestjs/passport', () => ({
  PassportStrategy: jest.fn(() => class {}),
}));

jest.mock('passport-jwt', () => ({
  ExtractJwt: {
    fromAuthHeaderAsBearerToken: jest.fn(() => jest.fn()),
  },
  Strategy: class {},
}));

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should return userId and username from the JWT payload', async () => {
    const payload = { sub: 'user-id-1', username: 'admin' };

    const result = await strategy.validate(payload);

    expect(result).toEqual({ userId: 'user-id-1', username: 'admin' });
  });

  it('should map sub to userId', async () => {
    const payload = { sub: 'abc-123', username: 'testuser' };

    const result = await strategy.validate(payload);

    expect(result.userId).toBe('abc-123');
  });

  it('should preserve the username exactly', async () => {
    const payload = { sub: '1', username: 'Super_Admin' };

    const result = await strategy.validate(payload);

    expect(result.username).toBe('Super_Admin');
  });
});
