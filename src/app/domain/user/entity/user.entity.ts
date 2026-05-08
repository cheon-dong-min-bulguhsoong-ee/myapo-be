import { DomainError } from "../../common/error/domain.error";
import { ErrorCode } from "../../common/error/error-code";

/**
 * 시스템 사용자 엔티티.
 */
export class User {
  constructor(
    public readonly id: bigint,
    public readonly email: string,
    public readonly name: string,
    public readonly nationality: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    private _lastLoginAt: Date | null,
    private _isDelete: boolean,
  ) {
    this.validateNationality(nationality);
  }

  get isDelete(): boolean {
    return this._isDelete;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  /**
   * 로그인 정보를 기록한다. (이메일 동기화 포함)
   */
  public recordLogin(currentEmail?: string): void {
    this._lastLoginAt = new Date();
    if (currentEmail && currentEmail !== this.email) {
      // ADR-001: 토큰 정보를 Source of Truth로 간주하여 이메일 동기화
      (this as any).email = currentEmail;
    }
  }

  /**
   * 계정을 삭제(Soft Delete) 상태로 변경한다.
   */
  public markAsDeleted(): void {
    this._isDelete = true;
  }

  /**
   * 계정을 다시 활성화한다.
   */
  public reactivate(): void {
    this._isDelete = false;
  }

  /**
   * 국적 코드가 ISO 3166-1 alpha-2 형식(2자리 영문 대문자)인지 검증한다.
   */
  private validateNationality(nationality: string): void {
    const iso2Regex = /^[A-Z]{2}$/;
    if (!iso2Regex.test(nationality)) {
      throw new DomainError(ErrorCode.User.INVALID_NATIONALITY, {
        nationality,
      });
    }
  }
}
