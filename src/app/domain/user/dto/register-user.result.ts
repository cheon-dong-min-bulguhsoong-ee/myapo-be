import { UserResult } from './user.result';

export class RegisterUserResult {
  constructor(
    public readonly user: UserResult,
    public readonly accessToken: string,
  ) {}
}
