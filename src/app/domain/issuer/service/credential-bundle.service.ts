import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CredentialBundle } from '../entity/credential-bundle.entity';
import { CredentialRequest } from '../entity/credential-request.entity';
import { ISSUER_CATEGORY_MAP, IssuerCode } from '../enum/issuer-code.enum';
import {
  CreateCredentialRequestRow,
  CredentialBundleRepository,
} from '../repository/credential-bundle.repository';

@Injectable()
export class CredentialBundleService {
  constructor(private readonly bundleRepository: CredentialBundleRepository) {}

  async createForUser(
    userId: bigint,
    issuerCodes: IssuerCode[],
  ): Promise<{ bundle: CredentialBundle; requests: CredentialRequest[] }> {
    const uniqueIssuers = Array.from(new Set(issuerCodes));
    const bundleCode = randomUUID();
    const rows: CreateCredentialRequestRow[] = uniqueIssuers.map(
      (issuerCode) => ({
        issuerCode,
        category: ISSUER_CATEGORY_MAP[issuerCode],
      }),
    );
    return this.bundleRepository.createWithRequests(bundleCode, userId, rows);
  }
}
