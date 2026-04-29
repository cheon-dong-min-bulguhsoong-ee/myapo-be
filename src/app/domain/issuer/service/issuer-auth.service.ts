import { Injectable } from '@nestjs/common';
import { PasswordEncoder } from '../../common/contract/password-encoder';
import { TokenProvider } from '../../common/contract/token-provider';
import { IssuerAuthResult } from '../dto/issuer-auth.result';
import { Issuer } from '../entity/issuer.entity';
import { IssuerCode } from '../enum/issuer-code.enum';
import { IssuerAuthError } from '../error/issuer-auth.error';
import { IssuerRepository } from '../repository/issuer.repository';

@Injectable()
export class IssuerAuthService {
  constructor(
    private readonly issuerRepository: IssuerRepository,
    private readonly passwordEncoder: PasswordEncoder,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async signup(
    code: IssuerCode,
    name: string,
    walletAddress: string,
    adminId: string,
    password: string,
  ): Promise<IssuerAuthResult> {
    const existingByCode = await this.issuerRepository.findByCode(code);
    if (existingByCode !== null) {
      throw IssuerAuthError.issuerAlreadyRegistered(code);
    }
    const existingByAdminId = await this.issuerRepository.findByAdminId(adminId);
    if (existingByAdminId !== null) {
      throw IssuerAuthError.adminIdTaken(adminId);
    }

    const issuer = await this.issuerRepository.create({
      code,
      name,
      walletAddress,
      adminId,
      passwordHash: this.passwordEncoder.encode(password),
    });
    return this.issueToken(issuer);
  }

  async login(adminId: string, password: string): Promise<IssuerAuthResult> {
    const issuer = await this.issuerRepository.findByAdminId(adminId);
    if (issuer === null) {
      throw IssuerAuthError.invalidCredentials();
    }
    if (!this.passwordEncoder.matches(password, issuer.passwordHash)) {
      throw IssuerAuthError.invalidCredentials();
    }
    if (!issuer.isActive()) {
      throw IssuerAuthError.issuerInactive(issuer.status);
    }
    return this.issueToken(issuer);
  }

  private issueToken(issuer: Issuer): IssuerAuthResult {
    const issued = this.tokenProvider.sign(issuer.adminId, {
      issuerCode: issuer.code,
    });
    return new IssuerAuthResult(issuer, issued.token, issued.expiresAt);
  }
}
