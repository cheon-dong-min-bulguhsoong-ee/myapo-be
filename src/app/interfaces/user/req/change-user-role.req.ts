import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { UserRole } from "../../../domain/user/enum/user-role.enum";

export class ChangeUserRoleReq {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  @IsNotEmpty()
  readonly role!: UserRole;
}
