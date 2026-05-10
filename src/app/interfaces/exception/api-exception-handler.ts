import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { DomainError } from "../../domain/common/error/domain.error";
import { CommonRes } from "../common/common-res";

/**
 * 글로벌 예외 필터.
 *
 * 처리 우선순위:
 *   1) DomainError      → errorCode 의 httpStatus/code/message 를 그대로 응답에 매핑 (기본 흐름)
 *   2) HttpException    → NestJS 가 던지는 표준 HTTP 예외 (404·400 등)
 *   3) 그 외 unknown    → 500 INTERNAL_SERVER_ERROR
 *
 * 새 도메인 에러 추가 시 ErrorCode 카탈로그에 한 줄만 추가하면 된다 — 이 핸들러는 손댈 필요 없음.
 */
@Catch()
export class ApiExceptionHandler implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionHandler.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();

    if (exception instanceof DomainError) {
      this.handleDomainError(request, response, exception);
      return;
    }

    if (exception instanceof HttpException) {
      this.handleHttpException(response, exception);
      return;
    }

    this.handleUnknown(request, response, exception);
  }

  private handleDomainError(
    request: Request,
    response: Response,
    exception: DomainError,
  ): void {
    const { code, message, httpStatus } = exception.errorCode;
    this.logger.warn(`[${request.method} ${request.url}] ${code} ${message}`);
    response
      .status(httpStatus)
      .json(CommonRes.fail(code, message, exception.data));
  }

  private handleHttpException(
    response: Response,
    exception: HttpException,
  ): void {
    const status = exception.getStatus();
    const raw = exception.getResponse();
    const message = this.extractHttpMessage(raw, exception.message);
    const code = HttpStatus[status] ?? "HTTP_ERROR";
    response.status(status).json(CommonRes.fail(String(code), message));
  }

  private handleUnknown(
    request: Request,
    response: Response,
    exception: unknown,
  ): void {
    const detail =
      exception instanceof Error ? exception.message : String(exception);
    this.logger.error(
      `[${request.method} ${request.url}] unhandled`,
      exception instanceof Error ? exception.stack : detail,
    );
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(
        CommonRes.fail(
          "ERR_INTERNAL_SERVER_ERROR",
          "서버 내부 오류가 발생했습니다.",
          detail,
        ),
      );
  }

  private extractHttpMessage(raw: unknown, fallback: string): string {
    if (typeof raw === "string") {
      return raw;
    }
    if (raw !== null && typeof raw === "object" && "message" in raw) {
      const candidate = (raw as { message?: unknown }).message;
      if (typeof candidate === "string") {
        return candidate;
      }
      if (Array.isArray(candidate)) {
        return candidate.join(", ");
      }
    }
    return fallback;
  }
}
