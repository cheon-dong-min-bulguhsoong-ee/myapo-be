import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class IssueCredentialRequest {
  @ApiPropertyOptional({ maxLength: 50, example: 'bank-system' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  requester?: string;
}
