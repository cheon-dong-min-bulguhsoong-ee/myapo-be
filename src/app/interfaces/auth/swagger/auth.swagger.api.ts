import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiCommonRes } from "../../common/api-common-res.decorator";
import { AuthRes } from "../res/auth.res";

export const AuthApiTags = (): ClassDecorator => ApiTags("Auth");

export const SignInSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "통합 로그인/회원가입 (Sign-In)",
      description:
        "Web3Auth 인증 토큰을 확인하여 로그인을 처리합니다. 시스템에 등록되지 않은 사용자인 경우, 요청 본문의 데이터를 사용하여 회원가입을 함께 수행합니다.",
    }),
    ApiBearerAuth("ExternalJwtBearer"),
    ApiCommonRes(AuthRes),
  );

export const LogoutSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "로그아웃",
      description:
        "사용자 로그아웃 처리를 수행합니다. (현재는 성공 응답만 반환)",
    }),
    ApiBearerAuth("InternalJwtBearer"),
    ApiCommonRes(Object),
  );
