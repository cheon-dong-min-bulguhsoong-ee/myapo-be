import { Injectable } from '@nestjs/common';
import { Document as DocumentRow } from '@prisma/client';
import { Document } from '../../../../domain/document/entity/document.entity';
import { DocumentStage } from '../../../../domain/document/enum/document-stage.enum';
import { DocumentStatus } from '../../../../domain/document/enum/document-status.enum';
import {
  CreateDocumentInput,
  DocumentRepository,
} from '../../../../domain/document/repository/document.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DocumentRepositoryImpl extends DocumentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateDocumentInput): Promise<Document> {
    const row = await this.prisma.document.create({
      data: {
        documentCode: input.documentCode,
        userId: input.userId,
        documentTypeCode: input.documentTypeCode,
        status: input.status,
        currentStage: input.currentStage,
        requestedAt: input.requestedAt,
      },
    });
    return this.toEntity(row);
  }

  private toEntity(row: DocumentRow): Document {
    return new Document(
      row.id,
      row.documentCode,
      row.userId,
      row.documentTypeCode,
      row.status as DocumentStatus,
      row.currentStage as DocumentStage,
      row.failureReason,
      row.xrplCreateTxHash,
      row.xrplLedgerIndex,
      row.payloadHash,
      row.requestedAt,
      row.issuedAt,
      row.expiresAt,
      row.revokedAt,
      row.createdAt,
      row.updatedAt,
    );
  }
}
