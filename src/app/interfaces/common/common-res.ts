import { ApiProperty } from '@nestjs/swagger';

export class CommonRes<T> {
  @ApiProperty({ example: true })
  public readonly success: boolean;

  @ApiProperty({ nullable: true, example: null })
  public readonly code: string | null;

  @ApiProperty({ nullable: true, example: null })
  public readonly message: string | null;

  @ApiProperty({ nullable: true })
  public readonly data: T | null;

  private constructor(
    success: boolean,
    code: string | null,
    message: string | null,
    data: T | null,
  ) {
    this.success = success;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T): CommonRes<T> {
    return new CommonRes<T>(true, null, null, data);
  }

  static fail<T = null>(
    code: string,
    message: string,
    data: T | null = null,
  ): CommonRes<T> {
    return new CommonRes<T>(false, code, message, data);
  }
}
