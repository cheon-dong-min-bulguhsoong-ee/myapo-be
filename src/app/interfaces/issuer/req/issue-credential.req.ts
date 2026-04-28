import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class IssueCredentialReq {
  @ApiPropertyOptional({ maxLength: 50, example: 'bank-system' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  requester?: string;
}
