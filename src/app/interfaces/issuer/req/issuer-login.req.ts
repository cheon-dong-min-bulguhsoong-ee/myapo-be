import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class IssuerLoginReq {
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
