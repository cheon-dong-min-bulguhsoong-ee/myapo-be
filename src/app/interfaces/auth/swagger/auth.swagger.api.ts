import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiCommonRes } from "../../common/api-common-res.decorator";
import { AuthRes } from "../res/auth.res";

export const AuthApiTags = (): ClassDecorator => ApiTags("Auth");

export const LoginSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "사용자 로그인",
      description:
        "Web3Auth 인증 후 소셜 계정 정보를 확인하여 로그인 처리하고 자체 Access Token(JWT)을 발행합니다.",
    }),
    ApiCommonRes(AuthRes),
  );

export const LogoutSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: "로그아웃",
      description:
        "사용자 로그아웃 처리를 수행합니다. (현재는 성공 응답만 반환)",
    }),
    ApiCommonRes(Object),
  );
