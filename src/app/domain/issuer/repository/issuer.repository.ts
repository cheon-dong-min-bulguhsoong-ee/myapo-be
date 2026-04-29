import { Issuer } from '../entity/issuer.entity';
import { IssuerCode } from '../enum/issuer-code.enum';

export abstract class IssuerRepository {
  abstract findByCode(code: IssuerCode): Promise<Issuer | null>;

  abstract findByAdminId(adminId: string): Promise<Issuer | null>;

  abstract create(input: {
    code: IssuerCode;
    name: string;
    walletAddress: string;
    adminId: string;
    passwordHash: string;
  }): Promise<Issuer>;
}
