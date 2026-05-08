import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "../repository/user.repository";
import { DomainError } from "../../common/error/domain.error";
import { ErrorCode } from "../../common/error/error-code";
import { User } from "../entity/user.entity";
import { UserWallet } from "../entity/user-wallet.entity";
import { VerifierType } from "../enum/verifier-type.enum";

describe("UserService", () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByVerifier: jest.fn(),
            findByXrplAddress: jest.fn(),
            findWalletByUserId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            reactivate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  describe("register", () => {
    const input = {
      email: "test@example.com",
      name: "Test",
      nationality: "KR",
      verifier: "google",
      verifierId: "sub-123",
      xrplAddress: "rAddress",
      publicKey: "pubKey",
    };

    it("새로운 유저를 성공적으로 등록한다", async () => {
      repository.findByVerifier.mockResolvedValue(null);
      repository.findByEmail.mockResolvedValue(null);
      repository.findByXrplAddress.mockResolvedValue(null);
      repository.create.mockResolvedValue(
        new User(
          BigInt(1),
          input.email,
          input.name,
          input.nationality,
          new Date(),
          new Date(),
          null,
          false,
        ),
      );
      repository.update.mockResolvedValue(undefined);

      const result = await service.register(input);
      expect(result.email).toBe(input.email);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalled();
    });

    it("이미 존재하는 활성 소셜 계정인 경우 DomainError를 던진다", async () => {
      repository.findByVerifier.mockResolvedValue(
        new User(
          BigInt(1),
          input.email,
          input.name,
          input.nationality,
          new Date(),
          new Date(),
          null,
          false,
        ),
      );

      await expect(service.register(input)).rejects.toThrow(
        new DomainError(ErrorCode.User.VERIFIER_DUPLICATED),
      );
    });

    it("탈퇴한 계정을 성공적으로 복구하고 로그인 정보를 기록한다", async () => {
      const deletedUser = new User(
        BigInt(1),
        input.email,
        input.name,
        input.nationality,
        new Date(),
        new Date(),
        null,
        true,
      );
      const wallet = new UserWallet(
        BigInt(1),
        BigInt(1),
        VerifierType.GOOGLE,
        input.verifierId,
        input.xrplAddress,
        input.publicKey,
        new Date(),
        new Date(),
        new Date(),
      );

      repository.findByVerifier.mockResolvedValue(deletedUser);
      repository.findWalletByUserId.mockResolvedValue(wallet);
      repository.reactivate.mockResolvedValue(undefined);
      repository.findById.mockResolvedValue(
        new User(
          BigInt(1),
          input.email,
          input.name,
          input.nationality,
          new Date(),
          new Date(),
          null,
          false,
        ),
      );
      repository.update.mockResolvedValue(undefined);

      const result = await service.register(input);
      expect(repository.reactivate).toHaveBeenCalledWith(deletedUser.id);
      expect(repository.update).toHaveBeenCalled();
      expect(result.email).toBe(input.email);
    });

    it("계정 복구 중 지갑 주소가 다르면 DomainError를 던진다", async () => {
      const deletedUser = new User(
        BigInt(1),
        input.email,
        input.name,
        input.nationality,
        new Date(),
        new Date(),
        null,
        true,
      );
      const wallet = new UserWallet(
        BigInt(1),
        BigInt(1),
        VerifierType.GOOGLE,
        input.verifierId,
        "differentAddress",
        input.publicKey,
        new Date(),
        new Date(),
        new Date(),
      );

      repository.findByVerifier.mockResolvedValue(deletedUser);
      repository.findWalletByUserId.mockResolvedValue(wallet);

      await expect(service.register(input)).rejects.toThrow(
        new DomainError(ErrorCode.User.REACTIVATION_BLOCKED),
      );
    });
  });

  describe("login", () => {
    it("활성 사용자인 경우 성공적으로 로그인 정보를 반환하고 사이드 이펙트를 처리한다", async () => {
      const user = new User(
        BigInt(1),
        "test@example.com",
        "Test",
        "KR",
        new Date(),
        new Date(),
        null,
        false,
      );
      const wallet = new UserWallet(
        BigInt(1),
        BigInt(1),
        VerifierType.GOOGLE,
        "sub-123",
        "rAddress",
        "pubKey",
        new Date(),
        new Date(),
        new Date(),
      );

      repository.findByVerifier.mockResolvedValue(user);
      repository.findWalletByUserId.mockResolvedValue(wallet);
      repository.update.mockResolvedValue(undefined);

      const newEmail = "new@example.com";
      const result = await service.login("google", "sub-123", newEmail);

      expect(result.id).toBe("1");
      expect(user.email).toBe(newEmail); // 이메일 동기화 확인
      expect(user.lastLoginAt).not.toBeNull(); // 로그인 시간 기록 확인
      expect(repository.update).toHaveBeenCalledWith(user);
    });

    it("사용자가 존재하지 않으면 DomainError를 던진다", async () => {
      repository.findByVerifier.mockResolvedValue(null);

      await expect(service.login("google", "sub-123")).rejects.toThrow(
        new DomainError(ErrorCode.User.USER_NOT_FOUND),
      );
    });

    it("사용자가 삭제된 상태면 DomainError를 던진다", async () => {
      const user = new User(
        BigInt(1),
        "test@example.com",
        "Test",
        "KR",
        new Date(),
        new Date(),
        null,
        true,
      );
      repository.findByVerifier.mockResolvedValue(user);

      await expect(service.login("google", "sub-123")).rejects.toThrow(
        new DomainError(ErrorCode.User.USER_NOT_FOUND),
      );
    });
  });

  describe("getProfile", () => {
    it("유저 프로필을 성공적으로 조회한다", async () => {
      const user = new User(
        BigInt(1),
        "a@a.com",
        "N",
        "KR",
        new Date(),
        new Date(),
        null,
        false,
      );
      const wallet = new UserWallet(
        BigInt(1),
        BigInt(1),
        VerifierType.GOOGLE,
        "v1",
        "r1",
        "p1",
        new Date(),
        new Date(),
        new Date(),
      );

      repository.findById.mockResolvedValue(user);
      repository.findWalletByUserId.mockResolvedValue(wallet);

      const result = await service.getProfile(BigInt(1));
      expect(result.email).toBe(user.email);
      expect(result.wallet.xrplAddress).toBe(wallet.xrplAddress);
    });

    it("삭제된 유저 조회 시 DomainError를 던진다", async () => {
      const user = new User(
        BigInt(1),
        "a@a.com",
        "N",
        "KR",
        new Date(),
        new Date(),
        null,
        true,
      );
      repository.findById.mockResolvedValue(user);

      await expect(service.getProfile(BigInt(1))).rejects.toThrow(
        new DomainError(ErrorCode.User.USER_NOT_FOUND),
      );
    });
  });

  describe("delete", () => {
    it("유저를 성공적으로 삭제(Soft Delete)한다", async () => {
      const user = new User(
        BigInt(1),
        "a@a.com",
        "N",
        "KR",
        new Date(),
        new Date(),
        null,
        false,
      );
      repository.findById.mockResolvedValue(user);

      await service.delete(BigInt(1));
      expect(user.isDelete).toBe(true);
      expect(repository.update).toHaveBeenCalled();
    });
  });
});
