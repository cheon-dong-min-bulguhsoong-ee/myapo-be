import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommonRes } from '../common/common-res';
import { ApiException } from './api-exception';
import { ExceptionMessage } from './exception-message';

@Catch()
export class ApiExceptionHandler implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionHandler.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();

    if (exception instanceof ApiException) {
      this.handleApiException(request, response, exception);
      return;
    }

    if (exception instanceof HttpException) {
      this.handleHttpException(response, exception);
      return;
    }

    this.handleUnknown(request, response, exception);
  }

  private handleApiException(
    request: Request,
    response: Response,
    exception: ApiException,
  ): void {
    this.logger.warn(
      `[${request.method} ${request.url}] ${exception.code} ${exception.message}`,
    );
    const body = CommonRes.fail(
      new ExceptionMessage(exception.code, exception.message, exception.data),
    );
    response.status(exception.httpStatus).json(body);
  }

  private handleHttpException(
    response: Response,
    exception: HttpException,
  ): void {
    const status = exception.getStatus();
    const raw = exception.getResponse();
    const message = this.extractHttpMessage(raw, exception.message);
    const code = HttpStatus[status] ?? 'HTTP_ERROR';
    const body = CommonRes.fail(new ExceptionMessage(String(code), message));
    response.status(status).json(body);
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
    const body = CommonRes.fail(
      new ExceptionMessage(
        'ERR_INTERNAL_SERVER_ERROR',
        '서버 내부 오류가 발생했습니다.',
        detail,
      ),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }

  private extractHttpMessage(raw: unknown, fallback: string): string {
    if (typeof raw === 'string') {
      return raw;
    }
    if (raw !== null && typeof raw === 'object' && 'message' in raw) {
      const candidate = (raw as { message?: unknown }).message;
      if (typeof candidate === 'string') {
        return candidate;
      }
      if (Array.isArray(candidate)) {
        return candidate.join(', ');
      }
    }
    return fallback;
  }
}
