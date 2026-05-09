import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { XrplCredentialDeleteSubmitterRole } from '../../../domain/credential/enum/xrpl-credential-delete-submitter-role.enum';

export class DeleteTestnetCredentialReq {
  @ApiProperty({
    enum: XrplCredentialDeleteSubmitterRole,
    description: 'XLS-70 CredentialDelete submitter. SUBJECT signs as the credential holder, ISSUER signs as the issuer.',
    example: XrplCredentialDeleteSubmitterRole.SUBJECT,
  })
  @IsEnum(XrplCredentialDeleteSubmitterRole)
  readonly submitterRole!: XrplCredentialDeleteSubmitterRole;
}
