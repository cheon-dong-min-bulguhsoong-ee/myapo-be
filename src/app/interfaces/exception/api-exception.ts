import { HttpStatus } from '@nestjs/common';
import { ExceptionCode } from './exception-code';

export class ApiException extends Error {
  constructor(
    public readonly exceptionCode: ExceptionCode,
    public readonly data: unknown = null,
  ) {
    super(exceptionCode.message);
    this.name = 'ApiException';
  }

  get code(): string {
    return this.exceptionCode.code;
  }

  get httpStatus(): HttpStatus {
    return this.exceptionCode.httpStatus;
  }
}
