import { MyDataCategory } from '../../common/enum/mydata-category.enum';
import { CredentialBundle } from '../entity/credential-bundle.entity';
import { CredentialRequest } from '../entity/credential-request.entity';
import { IssuerCode } from '../enum/issuer-code.enum';

export interface CreateCredentialRequestRow {
  issuerCode: IssuerCode;
  category: MyDataCategory;
}

export abstract class CredentialBundleRepository {
  abstract createWithRequests(
    bundleCode: string,
    userId: bigint,
    rows: CreateCredentialRequestRow[],
  ): Promise<{ bundle: CredentialBundle; requests: CredentialRequest[] }>;
}
