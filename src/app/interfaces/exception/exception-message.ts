import { ApiProperty } from '@nestjs/swagger';

export class ExceptionMessage {
  @ApiProperty({ example: 'ERR_USER_NOT_FOUND' })
  public readonly code: string;

  @ApiProperty({ example: '사용자를 찾을 수 없습니다.' })
  public readonly message: string;

  @ApiProperty({ nullable: true })
  public readonly data: unknown;

  constructor(code: string, message: string, data: unknown = null) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
