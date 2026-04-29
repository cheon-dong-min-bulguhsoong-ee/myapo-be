import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IssuerCode } from '../../../domain/issuer/enum/issuer-code.enum';

export class RequestCredentialReq {
  @ApiProperty({ example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  @IsString()
  @MinLength(25)
  @MaxLength(35)
  xrplAddress!: string;

  @ApiProperty({
    enum: IssuerCode,
    enumName: 'IssuerCode',
    isArray: true,
    example: [
      IssuerCode.MOJ,
      IssuerCode.NTS_INCOME,
      IssuerCode.NTS_TAX,
      IssuerCode.NHIS,
      IssuerCode.TOSS_ARC,
    ],
    description:
      '발급을 요청할 출처 목록 (1개 이상, 중복 불가). 출처별 카테고리는 자동 매핑됩니다.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(IssuerCode, { each: true })
  issuers!: IssuerCode[];
}