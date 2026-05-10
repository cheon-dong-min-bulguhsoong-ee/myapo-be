import { Injectable } from "@nestjs/common";
import { DocumentType as DocumentTypeRow } from "@prisma/client";
import { CredentialDocumentType } from "../../../../domain/credential/entity/credential-document-type.entity";
import { CredentialDocumentTypeRepository } from "../../../../domain/credential/repository/credential-document-type.repository";
import { DocumentTypeStatus } from "../../../../domain/document/enum/document-type-status.enum";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class CredentialDocumentTypeRepositoryImpl extends CredentialDocumentTypeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findActiveByCode(code: string): Promise<CredentialDocumentType | null> {
    const row = await this.prisma.documentType.findFirst({
      where: { code, status: DocumentTypeStatus.ACTIVE, isDelete: false },
    });
    return row === null ? null : this.toEntity(row);
  }

  private toEntity(row: DocumentTypeRow): CredentialDocumentType {
    return new CredentialDocumentType(
      row.code,
      row.name,
      row.issuerCode,
      row.defaultTtlMonths,
    );
  }
}
