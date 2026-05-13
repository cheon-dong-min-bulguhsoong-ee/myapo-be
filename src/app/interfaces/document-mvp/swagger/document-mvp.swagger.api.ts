import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ApiCommonRes } from "../../common/api-common-res.decorator";
import { AdvanceDocumentMvpRes } from "../res/advance-document-mvp.res";
import { CreateDocumentMvpRes } from "../res/create-document-mvp.res";
import { DocumentMvpDetailRes } from "../res/document-mvp-detail.res";
import { DocumentMvpListRes } from "../res/document-mvp-list.res";

export const DocumentMvpApiTags = (): ClassDecorator =>
  ApiTags("Documents (MVP)");

export const CreateDocumentMvpSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "문서 발급 신청 (MVP)",
      description:
        "사용자가 카탈로그에서 한 종류를 선택해 발급을 신청한다.\n\n" +
        "Mock 흐름:\n" +
        "- stage 1 (AUTHORITY_DOC_ISSUED) PENDING — current_stage 로 시작\n\n" +
        "이후 advance 호출로 한 단계씩 전이된다.\n\n" +
        "*인증*: `Authorization: Bearer <accessToken>` 필수.",
    }),
    ApiBearerAuth("InternalJwtBearer"),
    ApiCommonRes(CreateDocumentMvpRes),
  );

export const AdvanceDocumentMvpSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "다음 단계 전이 (MVP)",
      description:
        "현재 current_stage 의 PENDING 이벤트를 DONE 으로 마감하고 다음 stage 로 전이.\n" +
        "stage 4 (APOSTILLE_DOC_ISSUED) 도달 후 advance 호출 시 DONE + status=VALID + issuedAt 설정.\n\n" +
        "*제약*: (1) 본인 소유 문서만 가능. (2) status=VALID 인 문서는 거부.\n\n" +
        "*인증*: `Authorization: Bearer <accessToken>` 필수.",
    }),
    ApiBearerAuth("InternalJwtBearer"),
    ApiParam({
      name: "documentCode",
      description: "발급 신청 시 받은 문서 외부 코드 (UUID).",
      example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    }),
    ApiCommonRes(AdvanceDocumentMvpRes),
  );

export const GetDocumentMvpDetailSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "문서 상세 (history/app-1 화면)",
      description:
        "한 문서의 전체 진행 상황 + 5단계 stage 스냅샷. " +
        "FE 는 stages[] 의 status / completedAt 을 보고 진행 표시 (✓ / 진행 중 / 미진행) 매핑.\n\n" +
        "*인증*: `Authorization: Bearer <accessToken>` 필수.",
    }),
    ApiBearerAuth("InternalJwtBearer"),
    ApiParam({
      name: "documentCode",
      description: "문서 외부 코드 (UUID).",
      example: "9f2b1a3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    }),
    ApiCommonRes(DocumentMvpDetailRes),
  );

export const ListDocumentMvpSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "내 문서 리스트 (history 화면)",
      description:
        "본인 소유 문서 전체. requestedAt DESC 정렬.\n\n" +
        "*인증*: `Authorization: Bearer <accessToken>` 필수.",
    }),
    ApiBearerAuth("InternalJwtBearer"),
    ApiCommonRes(DocumentMvpListRes),
  );
