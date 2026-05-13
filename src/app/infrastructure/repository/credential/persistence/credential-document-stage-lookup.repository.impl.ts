import { Injectable } from "@nestjs/common";
import { CredentialDocumentStageLookupRepository } from "../../../../domain/credential/repository/credential-document-stage-lookup.repository";
import { IssuePipelineStage } from "../../../../domain/credential/enum/issue-pipeline-stage.enum";
import { PrismaService } from "../../../prisma/prisma.service";

const ISSUE_PIPELINE_TO_DB_STAGE: Record<IssuePipelineStage, string> = {
  [IssuePipelineStage.AUTHORITY_ISSUED]: "AUTHORITY_DOC_ISSUED",
  [IssuePipelineStage.DOCUMENT_ARRIVED]: "TRANSLATOR_DOC_RECEIVED",
  [IssuePipelineStage.TRANSLATED_NOTARIZED]: "TRANSLATOR_DOC_NOTARIZED",
  [IssuePipelineStage.APOSTILLE_ISSUED]: "APOSTILLE_DOC_ISSUED",
};

@Injectable()
export class CredentialDocumentStageLookupRepositoryImpl extends CredentialDocumentStageLookupRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findS3ObjectKey(
    documentCode: string,
    stage: IssuePipelineStage,
  ): Promise<string | null> {
    const document = await this.prisma.document.findUnique({
      where: { documentCode },
      select: { id: true },
    });
    if (document === null) {
      return null;
    }

    const dbStage = ISSUE_PIPELINE_TO_DB_STAGE[stage];
    const stageRow = await this.prisma.documentStage.findFirst({
      where: { documentId: document.id, stage: dbStage, isDelete: false },
      orderBy: { createdAt: "desc" },
      select: { s3ObjectKey: true },
    });
    return stageRow?.s3ObjectKey ?? null;
  }
}
