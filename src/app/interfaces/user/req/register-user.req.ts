import { ApiProperty } from '@nestjs/swagger';
import { IsISO31661Alpha2, IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserReq {
  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @ApiProperty({ example: 'KR', description: 'ISO 3166-1 alpha-2' })
  @IsISO31661Alpha2()
  readonly nationality!: string;

  @ApiProperty({ example: 'rHb9CJA...' })
  @IsString()
  @IsNotEmpty()
  readonly xrplAddress!: string;

  @ApiProperty({ example: '02...' })
  @IsString()
  @IsNotEmpty()
  readonly publicKey!: string;
}
