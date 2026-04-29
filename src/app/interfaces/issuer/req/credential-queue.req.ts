import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { CredentialRequestStatus } from '../../../domain/issuer/enum/credential-request-status.enum';

export class CredentialQueueReq {
  @ApiPropertyOptional({
    enum: CredentialRequestStatus,
    enumName: 'CredentialRequestStatus',
    description: '상태 필터. 미지정 시 전체.',
  })
  @IsOptional()
  @IsEnum(CredentialRequestStatus)
  status?: CredentialRequestStatus;

  @ApiPropertyOptional({
    example: 1,
    description: '페이지 번호 (1부터)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: '페이지 크기 (기본 20, 최대 100)',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
