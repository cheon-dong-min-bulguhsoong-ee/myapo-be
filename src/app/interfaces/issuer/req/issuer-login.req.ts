import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { IssuerCode } from '../../../domain/issuer/issuer-code.enum';

export class IssuerLoginReq {
  @ApiProperty({ enum: IssuerCode, enumName: 'IssuerCode', example: IssuerCode.MOJ })
  @IsEnum(IssuerCode)
  issuerCode!: IssuerCode;

  @ApiProperty({ example: 'MOJ-ADMIN-01' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  adminId!: string;

  @ApiProperty({ example: 'demo-password!' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}