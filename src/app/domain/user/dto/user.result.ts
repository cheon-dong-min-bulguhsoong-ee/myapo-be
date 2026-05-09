export class UserWalletResult {
  constructor(public readonly xrplAddress: string) {}
}

/**
 * 사용자 도메인 결과 객체.
 */
export class UserResult {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly nationality: string,
    public readonly role: string,
    public readonly createdAt: Date,
    public readonly wallet: UserWalletResult,
  ) {}
}
