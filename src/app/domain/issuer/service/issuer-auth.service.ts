import { Injectable } from '@nestjs/common';
import { PasswordEncoder } from '../../common/contract/password-encoder';
import { TokenProvider } from '../../common/contract/token-provider';
import { IssuerAuthError } from '../error/issuer-auth.error';
import { IssuerAdmin } from '../entity/issuer-admin.entity';
import { IssuerAdminRepository } from '../repository/issuer-admin.repository';
import { IssuerCode } from '../enum/issuer-code.enum';
import { IssuerAuthResult } from '../dto/issuer-auth.result';

@Injectable()
export class IssuerAuthService {
  constructor(
    private readonly issuerAdminRepository: IssuerAdminRepository,
    private readonly passwordEncoder: PasswordEncoder,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async signup(
    issuerCode: IssuerCode,
    adminId: string,
    password: string,
  ): Promise<IssuerAuthResult> {
    const existing = await this.issuerAdminRepository.findByIssuerAndAdminId(
      issuerCode,
      adminId,
    );
    if (existing !== null) {
      throw IssuerAuthError.adminAlreadyExists(issuerCode, adminId);
    }
    const passwordHash = this.passwordEncoder.encode(password);
    const admin = await this.issuerAdminRepository.create({
      issuerCode,
      adminId,
      passwordHash,
    });
    return this.issueToken(admin);
  }

  async login(
    issuerCode: IssuerCode,
    adminId: string,
    password: string,
  ): Promise<IssuerAuthResult> {
    const admin = await this.issuerAdminRepository.findByIssuerAndAdminId(
      issuerCode,
      adminId,
    );
    if (admin === null) {
      throw IssuerAuthError.invalidCredentials();
    }
    if (!this.passwordEncoder.matches(password, admin.passwordHash)) {
      throw IssuerAuthError.invalidCredentials();
    }
    if (!admin.isActive()) {
      throw IssuerAuthError.adminInactive(admin.status);
    }
    return this.issueToken(admin);
  }

  private issueToken(admin: IssuerAdmin): IssuerAuthResult {
    const issued = this.tokenProvider.sign(admin.adminId, {
      issuerCode: admin.issuerCode,
      adminPk: admin.id.toString(),
    });
    return new IssuerAuthResult(admin, issued.token, issued.expiresAt);
  }
}
