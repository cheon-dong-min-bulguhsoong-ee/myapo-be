import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { IssuerCode } from '../../../domain/issuer/enum/issuer-code.enum';

export class IssuerSignupReq {
  @ApiProperty({ enum: IssuerCode, enumName: 'IssuerCode', example: IssuerCode.MOJ })
  @IsEnum(IssuerCode)
  issuerCode!: IssuerCode;

  @ApiProperty({
    example: '법무부',
    minLength: 1,
    maxLength: 50,
    description:
      '발급 기관 한국어 표시 이름. 해당 issuerCode 의 첫 가입자가 입력한 값으로 issuers 테이블에 등록되며, 이후 동일 issuerCode 가입자가 입력해도 무시되고 기존 값이 유지됩니다.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  issuerName!: string;

  @ApiProperty({
    example: 'rMOJDemoIssuerWalletAddrPlaceholder',
    minLength: 25,
    maxLength: 35,
    description:
      '발급 기관 XRPL 지갑 주소. 첫 가입자가 issuers 테이블에 등록. 이후 동일 issuerCode 가입자는 동일 지갑을 입력해야 하며, 다르면 ISSUER_WALLET_MISMATCH 에러.',
  })
  @IsString()
  @MinLength(25)
  @MaxLength(35)
  walletAddress!: string;

  @ApiProperty({ example: 'MOJ-ADMIN-01', minLength: 3, maxLength: 64 })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  adminId!: string;

  @ApiProperty({ example: 'demo-password!', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}