import { CredentialDocumentType } from "../entity/credential-document-type.entity";

export abstract class CredentialDocumentTypeRepository {
  abstract findActiveByCode(
    code: string,
  ): Promise<CredentialDocumentType | null>;
}
