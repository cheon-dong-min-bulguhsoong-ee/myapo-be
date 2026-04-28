import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ComplianceTrigger } from '../../../domain/compliance/compliance-trigger.enum';

export class ComplianceCheckReq {
  @ApiPropertyOptional({ enum: ComplianceTrigger, enumName: 'ComplianceTrigger' })
  @IsOptional()
  @IsEnum(ComplianceTrigger)
  triggeredBy?: ComplianceTrigger;
}
