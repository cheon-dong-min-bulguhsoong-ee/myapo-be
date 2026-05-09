import { Injectable } from "@nestjs/common";
import { PersonaType } from "../../common/enum/persona-type.enum";
import { DomainError } from "../../common/error/domain.error";
import { ErrorCode } from "../../common/error/error-code";
import { UserResult, UserWalletResult } from "../dto/user.result";
import { User } from "../entity/user.entity";
import { UserRole } from "../enum/user-role.enum";
import { UserRepository } from "../repository/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * 사용자를 등록하거나 탈퇴한 계정을 복구한다.
   */
  async register(input: {
    email: string;
    name: string;
    nationality: string;
    verifier: string;
    verifierId: string;
    xrplAddress: string;
    publicKey: string;
  }): Promise<UserResult> {
    // 1. 소셜 계정(Verifier + VerifierId)으로 기존 사용자 조회
    const existingUserByVerifier = await this.userRepository.findByVerifier(
      input.verifier,
      input.verifierId,
    );

    if (existingUserByVerifier) {
      if (!existingUserByVerifier.isDelete) {
        throw new DomainError(ErrorCode.User.VERIFIER_DUPLICATED);
      }

      // 탈퇴한 계정인 경우 복구 시도
      const wallet = await this.userRepository.findWalletByUserId(
        existingUserByVerifier.id,
      );
      if (wallet && wallet.xrplAddress !== input.xrplAddress) {
        throw new DomainError(ErrorCode.User.REACTIVATION_BLOCKED);
      }

      await this.userRepository.reactivate(existingUserByVerifier.id);
      const reactivatedUser = await this.userRepository.findById(
        existingUserByVerifier.id,
      );

      // 로그인 정보 업데이트 (Side-effect)
      await this.handleLoginSideEffects(reactivatedUser!, input.email);

      return this.mapToResult(reactivatedUser!, wallet!.xrplAddress);
    }

    // 2. 이메일 중복 체크 (활성 계정 기준)
    const existingUserByEmail = await this.userRepository.findByEmail(
      input.email,
    );
    if (existingUserByEmail && !existingUserByEmail.isDelete) {
      throw new DomainError(ErrorCode.User.EMAIL_DUPLICATED);
    }

    // 3. XRPL 주소 중복 체크 (활성 계정 기준)
    const existingUserByWallet = await this.userRepository.findByXrplAddress(
      input.xrplAddress,
    );
    if (existingUserByWallet && !existingUserByWallet.isDelete) {
      throw new DomainError(ErrorCode.User.WALLET_DUPLICATED);
    }

    // 4. 신규 생성
    const newUser = await this.userRepository.create({
      email: input.email,
      name: input.name,
      nationality: input.nationality,
      wallet: {
        verifier: input.verifier,
        verifierId: input.verifierId,
        xrplAddress: input.xrplAddress,
        publicKey: input.publicKey,
      },
    });

    // 신규 가입 시에도 로그인 정보 기록
    await this.handleLoginSideEffects(newUser, input.email);

    return this.mapToResult(newUser, input.xrplAddress);
  }

  /**
   * 소셜 계정 정보를 바탕으로 사용자를 조회한다. (로그인)
   */
  async login(
    verifier: string,
    verifierId: string,
    currentEmail?: string,
  ): Promise<UserResult> {
    const user = await this.userRepository.findByVerifier(verifier, verifierId);
    if (!user || user.isDelete) {
      throw new DomainError(ErrorCode.User.USER_NOT_FOUND);
    }

    // 로그인 정보 업데이트 (이메일 동기화 및 접속 시간 기록)
    await this.handleLoginSideEffects(user, currentEmail);

    const wallet = await this.userRepository.findWalletByUserId(user.id);
    return this.mapToResult(user, wallet!.xrplAddress);
  }

  /**
   * 로그인 시 발생하는 사이드 이펙트(시간 기록, 데이터 동기화)를 처리한다.
   */
  private async handleLoginSideEffects(
    user: User,
    currentEmail?: string,
  ): Promise<void> {
    user.recordLogin(currentEmail);
    await this.userRepository.update(user);
  }

  /**
   * 사용자의 프로필 정보를 조회한다.
   */
  async getProfile(userId: bigint): Promise<UserResult> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.isDelete) {
      throw new DomainError(ErrorCode.User.USER_NOT_FOUND);
    }

    const wallet = await this.userRepository.findWalletByUserId(userId);
    return this.mapToResult(user, wallet!.xrplAddress);
  }

  /**
   * 활성 상태인 사용자를 조회한다. (Document 도메인 등에서 사용)
   */
  async getActive(
    userId: bigint,
  ): Promise<User & { personaType: PersonaType }> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.isDelete) {
      throw new DomainError(ErrorCode.User.USER_NOT_FOUND);
    }

    // 국적에 따른 페르소나 타입 결정
    const personaType =
      user.nationality === "KR" ? PersonaType.KOREAN : PersonaType.FOREIGNER;

    return Object.assign(user, { personaType });
  }

  /**
   * 계정을 삭제(Soft Delete)한다.
   */
  async delete(userId: bigint): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.isDelete) {
      throw new DomainError(ErrorCode.User.USER_NOT_FOUND);
    }

    user.markAsDeleted();
    await this.userRepository.update(user);
  }

  /**
   * 사용자의 권한을 변경한다. (Admin 전용 기능의 내부 로직)
   */
  async changeRole(userId: bigint, newRole: UserRole): Promise<UserResult> {
    const user = await this.userRepository.findById(userId);
    if (!user || user.isDelete) {
      throw new DomainError(ErrorCode.User.USER_NOT_FOUND);
    }

    user.changeRole(newRole);
    await this.userRepository.update(user);

    const wallet = await this.userRepository.findWalletByUserId(userId);
    return this.mapToResult(user, wallet!.xrplAddress);
  }

  private mapToResult(user: User, xrplAddress: string): UserResult {
    return new UserResult(
      user.id.toString(),
      user.email,
      user.name,
      user.nationality,
      user.role,
      user.createdAt,
      new UserWalletResult(xrplAddress),
    );
  }
}
