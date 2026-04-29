import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenProvider } from '../../../domain/common/contract/token-provider';
import { IssuerRepository } from '../../../domain/issuer/repository/issuer.repository';
import { ApiException } from '../../exception/api-exception';
import { ExceptionCode } from '../../exception/exception-code';

@Injectable()
export class IssuerJwtGuard implements CanActivate {
  constructor(
    private readonly tokenProvider: TokenProvider,
    private readonly issuerRepository: IssuerRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = String(request.headers['authorization'] ?? '');
    const match = /^Bearer\s+(.+)$/.exec(header);
    if (match === null) {
      throw new ApiException(ExceptionCode.Issuer.UNAUTHORIZED);
    }

    const payload = this.tokenProvider.verify(match[1]);
    if (payload === null) {
      throw new ApiException(ExceptionCode.Issuer.UNAUTHORIZED);
    }

    const issuer = await this.issuerRepository.findByAdminId(payload.subject);
    if (issuer === null || !issuer.isActive()) {
      throw new ApiException(ExceptionCode.Issuer.UNAUTHORIZED);
    }

    request.issuer = issuer;
    return true;
  }
}
