import { ApiProperty } from '@nestjs/swagger';
import { ExceptionMessage } from './exception-message';
import { ResultType } from './result-type.enum';

export class BaseResponse<T> {
  @ApiProperty({ enum: ResultType, enumName: 'ResultType' })
  public readonly resultType: ResultType;

  @ApiProperty({ nullable: true })
  public readonly data: T | null;

  @ApiProperty({ type: () => ExceptionMessage, nullable: true })
  public readonly exception: ExceptionMessage | null;

  private constructor(
    resultType: ResultType,
    data: T | null,
    exception: ExceptionMessage | null,
  ) {
    this.resultType = resultType;
    this.data = data;
    this.exception = exception;
  }

  static success<T>(data: T): BaseResponse<T> {
    return new BaseResponse<T>(ResultType.SUCCESS, data, null);
  }

  static fail<T = null>(exception: ExceptionMessage): BaseResponse<T> {
    return new BaseResponse<T>(ResultType.FAIL, null, exception);
  }
}
