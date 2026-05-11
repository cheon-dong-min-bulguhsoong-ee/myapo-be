import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiCommonRes } from "../../common/api-common-res.decorator";
import { DisputeRes, ListDisputesRes } from "../res/dispute.res";

export const DisputeApiTags = (): ClassDecorator =>
  applyDecorators(ApiTags("Disputes"), ApiBearerAuth("InternalJwtBearer"));

export const CreateDisputeSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "이의제기(Dispute) 생성",
      description: "발급된 증명서에 대해 이의제기를 생성합니다.",
    }),
    ApiCommonRes(DisputeRes),
  );

export const GetMyDisputesSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "내 분쟁 목록 조회",
      description: "내가 제기한 분쟁들의 목록을 조회합니다.",
    }),
    ApiCommonRes(ListDisputesRes),
  );

export const GetDisputeSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "분쟁 상세 조회",
      description: "특정 분쟁의 상세 정보 및 타임라인을 조회합니다.",
    }),
    ApiCommonRes(DisputeRes),
  );

export const AssignOperatorSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "운영자 배정 (Admin)",
      description: "관리자가 분쟁 처리 운영자를 수동/자동 배정합니다.",
    }),
    ApiCommonRes(DisputeRes),
  );

export const ChangeDisputeStatusSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "분쟁 상태 변경 (Operator)",
      description: "운영자가 분쟁의 처리 상태를 변경합니다.",
    }),
    ApiCommonRes(DisputeRes),
  );
