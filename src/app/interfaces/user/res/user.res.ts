import { ApiProperty } from '@nestjs/swagger';
import { UserResult, UserWalletResult } from '../../../domain/user/dto/user.result';

export class UserWalletRes {
  @ApiProperty()
  readonly xrplAddress!: string;

  static from(result: UserWalletResult): UserWalletRes {
    return {
      xrplAddress: result.xrplAddress,
    };
  }
}

export class UserRes {
  @ApiProperty()
  readonly id!: string;

  @ApiProperty()
  readonly email!: string;

  @ApiProperty()
  readonly name!: string;

  @ApiProperty()
  readonly nationality!: string;

  @ApiProperty()
  readonly createdAt!: string;

  @ApiProperty()
  readonly wallet!: UserWalletRes;

  static from(result: UserResult): UserRes {
    return {
      id: result.id,
      email: result.email,
      name: result.name,
      nationality: result.nationality,
      createdAt: result.createdAt.toISOString(),
      wallet: UserWalletRes.from(result.wallet),
    };
  }
}

export class RegisterUserRes extends UserRes {
  @ApiProperty()
  readonly accessToken!: string;
}
