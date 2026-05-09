import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiCommonRes } from "../../common/api-common-res.decorator";
import { RegisterUserRes, UserRes } from "../res/user.res";

export const UserApiTags = (): ClassDecorator =>
  applyDecorators(ApiTags("Users"), ApiBearerAuth("InternalJwtBearer"));

export const RegisterUserSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "사용자 가입 및 복구",
      description:
        "Web3Auth 인증 후 사용자 정보를 등록하거나 탈퇴한 계정을 복구합니다. " +
        "성공 시 MyApo 자체 Access Token(JWT)을 반환합니다.",
    }),
    ApiBearerAuth("ExternalJwtBearer"), // Override global InternalJwtBearer
    ApiCommonRes(RegisterUserRes),
  );

export const GetMyProfileSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "내 정보 조회",
      description: "현재 로그인한 사용자의 프로필 정보를 조회합니다.",
    }),
    ApiCommonRes(UserRes),
  );

export const DeleteAccountSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "회원 탈퇴",
      description: "사용자 계정을 Soft Delete 처리합니다.",
    }),
    ApiCommonRes(Object), // No specific response body for 204
  );

export const ChangeUserRoleSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "사용자 권한 변경 (Admin 전용)",
      description:
        "특정 사용자의 권한을 변경합니다. 관리자(ADMIN) 권한이 필요합니다.",
    }),
    ApiCommonRes(UserRes),
  );
