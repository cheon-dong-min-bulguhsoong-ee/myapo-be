import { IssuerAdmin } from '../entity/issuer-admin.entity';
import { IssuerCode } from '../enum/issuer-code.enum';

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