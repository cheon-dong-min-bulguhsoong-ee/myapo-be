import { HttpStatus } from '@nestjs/common';

export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly data: unknown = null,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
