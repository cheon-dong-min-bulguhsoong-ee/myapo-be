import { ApiProperty } from "@nestjs/swagger";
import { UserResult } from "../../../domain/user/dto/user.result";
import { UserRes } from "../../user/res/user.res";

export class AuthRes extends UserRes {
  @ApiProperty()
  readonly accessToken!: string;

  static fromResult(result: UserResult, accessToken: string): AuthRes {
    return {
      ...UserRes.from(result),
      accessToken,
    };
  }
}
