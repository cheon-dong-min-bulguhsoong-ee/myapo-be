import { Injectable } from "@nestjs/common";
import { CredentialDocumentStageLookupRepository } from "../../../../domain/credential/repository/credential-document-stage-lookup.repository";
import { IssuePipelineStage } from "../../../../domain/credential/enum/issue-pipeline-stage.enum";
import { PrismaService } from "../../../prisma/prisma.service";

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

    const stageRow = await this.prisma.documentStage.findFirst({
      where: { documentId: document.id, stage, isDelete: false },
      orderBy: { createdAt: "desc" },
      select: { s3ObjectKey: true },
    });
    return stageRow?.s3ObjectKey ?? null;
  }
}
