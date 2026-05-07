import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenProvider } from '../../common/contract/token-provider';

describe('AuthService', () => {
  let service: AuthService;
  let tokenProvider: jest.Mocked<TokenProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: TokenProvider,
          useValue: {
            issueToken: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenProvider = module.get(TokenProvider);
  });

  it('사용자 정보를 바탕으로 토큰을 발행한다', async () => {
    tokenProvider.issueToken.mockReturnValue('test-token');
    const token = await service.issueAccessToken(BigInt(1), 'test@test.com');
    expect(token).toBe('test-token');
    expect(tokenProvider.issueToken).toHaveBeenCalledWith({
      sub: '1',
      email: 'test@test.com',
    });
  });

  it('토큰을 검증하고 페이로드를 반환한다', async () => {
    tokenProvider.verifyToken.mockReturnValue({ sub: '1', email: 'test@test.com' });
    const payload = await service.verifyAccessToken('test-token');
    expect(payload.userId).toBe(BigInt(1));
    expect(payload.email).toBe('test@test.com');
  });
});
