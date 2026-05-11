import { ApiProperty } from "@nestjs/swagger";
import {
  CredentialDetailResult,
  CredentialSummaryResult,
  ListCredentialsResult,
} from "../../../domain/credential/dto/credential.result";
import { CredentialStatus } from "../../../domain/credential/enum/credential-status.enum";
import { IssuePipelineStageItemRes } from "./credential-common.res";
import { CredentialSubmissionItemRes } from "./credential-submission.res";

export class CredentialSummaryRes {
  @ApiProperty()
  readonly credentialId!: string;

  @ApiProperty()
  readonly issueRequestId!: string;

  @ApiProperty()
  readonly documentTypeId!: string;

  @ApiProperty()
  readonly documentTypeName!: string;

  @ApiProperty()
  readonly issuerId!: string;

  @ApiProperty({ enum: CredentialStatus })
  readonly status!: CredentialStatus;

  @ApiProperty()
  readonly issuedAt!: string;

  @ApiProperty()
  readonly expiresAt!: string;

  @ApiProperty()
  readonly walletAddress!: string;

  @ApiProperty()
  readonly currentStage!: string;

  @ApiProperty({ nullable: true })
  readonly xrplNetwork!: string | null;

  @ApiProperty({ nullable: true })
  readonly xrplTxHash!: string | null;

  @ApiProperty({ nullable: true })
  readonly xrplLedgerIndex!: string | null;

  @ApiProperty({ nullable: true })
  readonly xrplEngineResult!: string | null;

  @ApiProperty({ nullable: true })
  readonly xrplValidated!: boolean | null;

  @ApiProperty({ nullable: true })
  readonly xrplCredentialType!: string | null;

  static from(result: CredentialSummaryResult): CredentialSummaryRes {
    return {
      credentialId: result.credentialId,
      issueRequestId: result.issueRequestId,
      documentTypeId: result.documentTypeId,
      documentTypeName: result.documentTypeName,
      issuerId: result.issuerId,
      status: result.status,
      issuedAt: result.issuedAt.toISOString(),
      expiresAt: result.expiresAt.toISOString(),
      walletAddress: result.walletAddress,
      currentStage: result.currentStage,
      xrplNetwork: result.xrplNetwork,
      xrplTxHash: result.xrplTxHash,
      xrplLedgerIndex: result.xrplLedgerIndex?.toString() ?? null,
      xrplEngineResult: result.xrplEngineResult,
      xrplValidated: result.xrplValidated,
      xrplCredentialType: result.xrplCredentialType,
    };
  }
}

export class ListCredentialsRes {
  @ApiProperty({ type: [CredentialSummaryRes] })
  readonly credentials!: CredentialSummaryRes[];

  static from(result: ListCredentialsResult): ListCredentialsRes {
    return { credentials: result.credentials.map(CredentialSummaryRes.from) };
  }
}

export class CredentialDetailRes extends CredentialSummaryRes {
  @ApiProperty({ type: [IssuePipelineStageItemRes] })
  readonly pipeline!: IssuePipelineStageItemRes[];

  @ApiProperty({ type: [CredentialSubmissionItemRes] })
  readonly submissions!: CredentialSubmissionItemRes[];

  static from(result: CredentialDetailResult): CredentialDetailRes {
    return {
      ...CredentialSummaryRes.from(result),
      pipeline: result.pipeline.map(IssuePipelineStageItemRes.from),
      submissions: result.submissions.map(CredentialSubmissionItemRes.from),
    };
  }
}
