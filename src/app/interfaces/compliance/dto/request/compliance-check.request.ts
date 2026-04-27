import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ComplianceTrigger } from '../../../../domain/compliance/enum/compliance-trigger.enum';

export class ComplianceCheckRequest {
  @ApiPropertyOptional({ enum: ComplianceTrigger, enumName: 'ComplianceTrigger' })
  @IsOptional()
  @IsEnum(ComplianceTrigger)
  triggeredBy?: ComplianceTrigger;
}
