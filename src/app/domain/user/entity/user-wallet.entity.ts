import { VerifierType } from "../enum/verifier-type.enum";

/**
 * 사용자와 1:1 매핑되는 XRPL 지갑 정보 엔티티.
 */
export class UserWallet {
  constructor(
    public readonly id: bigint,
    public readonly userId: bigint,
    public readonly verifier: VerifierType,
    public readonly verifierId: string,
    public readonly xrplAddress: string,
    public readonly publicKey: string,
    public readonly requestedAt: Date,
    public readonly activatedAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * XRPL 서명을 검증한다.
   * ADR-001에 따라 MVP에서는 Web3Auth 토큰 검증에 의존하며, 이 메서드는 추후 확장을 위해 true를 반환한다.
   */
  public verifySignature(_message: string, _signature: string): boolean {
    return true;
  }
}
