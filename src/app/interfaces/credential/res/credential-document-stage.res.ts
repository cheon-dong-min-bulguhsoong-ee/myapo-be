import { ApiProperty } from "@nestjs/swagger";
import {
  CredentialDocumentStageResult,
  ListCredentialsByDocumentStageResult,
} from "../../../domain/credential/dto/credential.result";
import { CredentialDocumentStageState } from "../../../domain/credential/enum/credential-document-stage-state.enum";
import { CredentialSummaryRes } from "./credential.res";

export class CredentialDocumentStageRes extends CredentialSummaryRes {
  @ApiProperty({ enum: CredentialDocumentStageState })
  readonly credentialState!: CredentialDocumentStageState;

  static from(result: CredentialDocumentStageResult): CredentialDocumentStageRes {
    return {
      ...CredentialSummaryRes.from(result),
      credentialState: result.credentialState,
    };
  }
}

export class ListCredentialsByDocumentStageRes {
  @ApiProperty({ type: [CredentialDocumentStageRes] })
  readonly credentials!: CredentialDocumentStageRes[];

  static from(
    result: ListCredentialsByDocumentStageResult,
  ): ListCredentialsByDocumentStageRes {
    return {
      credentials: result.credentials.map(CredentialDocumentStageRes.from),
    };
  }
}
