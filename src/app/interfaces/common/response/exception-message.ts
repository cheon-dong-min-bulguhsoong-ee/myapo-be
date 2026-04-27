import { ApiProperty } from '@nestjs/swagger';

export class ExceptionMessage {
  @ApiProperty({ example: 'USER_NOT_FOUND' })
  public readonly code: string;

  @ApiProperty({ example: 'User not found' })
  public readonly message: string;

  @ApiProperty({ nullable: true })
  public readonly data: unknown;

  constructor(code: string, message: string, data: unknown = null) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
