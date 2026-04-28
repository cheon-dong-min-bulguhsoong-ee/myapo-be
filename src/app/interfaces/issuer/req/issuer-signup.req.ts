import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { IssuerCode } from '../../../domain/issuer/enum/issuer-code.enum';

export class IssuerSignupReq {
  @ApiProperty({ enum: IssuerCode, enumName: 'IssuerCode', example: IssuerCode.MOJ })
  @IsEnum(IssuerCode)
  issuerCode!: IssuerCode;

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