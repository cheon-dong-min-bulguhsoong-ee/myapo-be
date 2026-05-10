import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { XrplCredentialDeleteSubmitterRole } from "../../../domain/credential/enum/xrpl-credential-delete-submitter-role.enum";

export class PrepareDeleteTestnetCredentialReq {
  @ApiProperty({
    enum: XrplCredentialDeleteSubmitterRole,
    description:
      "XLS-70 CredentialDelete signer role. SUBJECT signs with the credential holder wallet; ISSUER signs with the issuer wallet.",
    example: XrplCredentialDeleteSubmitterRole.SUBJECT,
  })
  @IsEnum(XrplCredentialDeleteSubmitterRole)
  readonly submitterRole!: XrplCredentialDeleteSubmitterRole;
}
