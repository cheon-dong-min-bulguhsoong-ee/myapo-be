import { IssuerAdmin } from './issuer-admin.entity';
import { IssuerCode } from './issuer-code.enum';

export abstract class IssuerAdminRepository {
  abstract findByIssuerAndAdminId(
    issuerCode: IssuerCode,
    adminId: string,
  ): Promise<IssuerAdmin | null>;

  abstract create(input: {
    issuerCode: IssuerCode;
    adminId: string;
    passwordHash: string;
  }): Promise<IssuerAdmin>;
}