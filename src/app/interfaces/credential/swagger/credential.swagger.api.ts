import { applyDecorators } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ApiCommonRes } from "../../common/api-common-res.decorator";
import { CredentialStatus } from "../../../domain/credential/enum/credential-status.enum";
import { AcceptTestnetCredentialReq } from "../req/accept-testnet-credential.req";
import { DeleteTestnetCredentialReq } from "../req/delete-testnet-credential.req";
import { PrepareDeleteTestnetCredentialReq } from "../req/prepare-delete-testnet-credential.req";
import {
  CreateCredentialIssueRequestRes,
  CredentialIssueRequestRes,
} from "../res/credential-issue-request.res";
import { ListCredentialsByDocumentStageRes } from "../res/credential-document-stage.res";
import { CredentialDetailRes, ListCredentialsRes } from "../res/credential.res";
import {
  ListCredentialSubmissionsRes,
  SubmitCredentialRes,
} from "../res/credential-submission.res";
import { XrplCredentialEvidenceRes } from "../res/xrpl-credential-evidence.res";
import { XrplCredentialTransactionRes } from "../res/xrpl-credential-transaction.res";

export const CredentialApiTags = (): ClassDecorator => ApiTags("Credentials");

const withBearer = <T extends MethodDecorator>(decorator: T): MethodDecorator =>
  applyDecorators(ApiBearerAuth("InternalJwtBearer"), decorator);

export const CreateCredentialIssueRequestSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({
        summary: "크리덴셜 발급 요청 생성",
        description:
          "Internal JWT 기반 사용자 발급 요청을 생성하고 XRP Testnet evidence 또는 MVP fallback Credential을 발급합니다.",
      }),
      ApiCommonRes(CreateCredentialIssueRequestRes),
    ),
  );

export const GetCredentialIssueRequestSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({ summary: "크리덴셜 발급 요청 조회" }),
      ApiCommonRes(CredentialIssueRequestRes),
    ),
  );

export const ListCredentialsSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({ summary: "내 크리덴셜 목록 조회" }),
      ApiQuery({
        name: "status",
        required: false,
        enum: CredentialStatus,
        description: "입력하지 않으면 현재 사용자의 모든 크리덴셜 상태를 조회합니다.",
      }),
      ApiCommonRes(ListCredentialsRes),
    ),
  );

export const ListCredentialsByDocumentStageSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({
        summary: "특정 document_stages.id 기준 크리덴셜 목록 조회",
      }),
      ApiParam({
        name: "documentStageId",
        required: true,
        description: "document_stages.id 값",
      }),
      ApiCommonRes(ListCredentialsByDocumentStageRes),
    ),
  );

export const GetCredentialDetailSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({ summary: "내 크리덴셜 상세 조회" }),
      ApiCommonRes(CredentialDetailRes),
    ),
  );

export const SubmitCredentialSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({ summary: "기관 요청에 크리덴셜 제출" }),
      ApiCommonRes(SubmitCredentialRes),
    ),
  );

export const ListCredentialSubmissionsSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({ summary: "내 크리덴셜 제출 이력 조회" }),
      ApiCommonRes(ListCredentialSubmissionsRes),
    ),
  );

export const PrepareAcceptTestnetCredentialSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({
        summary: "XRP Testnet CredentialAccept 서명 payload 생성",
      }),
      ApiCommonRes(XrplCredentialTransactionRes),
    ),
  );

export const AcceptTestnetCredentialSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({
        summary: "XRP Testnet CredentialAccept signed transaction 제출",
      }),
      ApiBody({ type: AcceptTestnetCredentialReq }),
      ApiCommonRes(XrplCredentialEvidenceRes),
    ),
  );

export const PrepareDeleteTestnetCredentialSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({
        summary: "XRP Testnet CredentialDelete 서명 payload 생성",
      }),
      ApiBody({ type: PrepareDeleteTestnetCredentialReq }),
      ApiCommonRes(XrplCredentialTransactionRes),
    ),
  );

export const DeleteTestnetCredentialSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({
        summary: "XRP Testnet CredentialDelete signed transaction 제출",
      }),
      ApiBody({ type: DeleteTestnetCredentialReq }),
      ApiCommonRes(XrplCredentialEvidenceRes),
    ),
  );
