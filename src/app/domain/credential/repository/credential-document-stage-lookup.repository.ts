import { IssuePipelineStage } from "../enum/issue-pipeline-stage.enum";

export abstract class CredentialDocumentStageLookupRepository {
  abstract findS3ObjectKey(
    documentCode: string,
    stage: IssuePipelineStage,
  ): Promise<string | null>;
}
