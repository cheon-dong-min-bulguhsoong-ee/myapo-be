import { Test, TestingModule } from "@nestjs/testing";
import { AuthFacade } from "./auth.facade";
import { AuthService } from "../../domain/auth/service/auth.service";
import { UserService } from "../../domain/user/service/user.service";
import {
  UserResult,
  UserWalletResult,
} from "../../domain/user/dto/user.result";

describe("AuthFacade", () => {
  let facade: AuthFacade;
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthFacade,
        {
          provide: UserService,
          useValue: {
            signIn: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            issueAccessToken: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    facade = module.get<AuthFacade>(AuthFacade);
    userService = module.get(UserService);
    authService = module.get(AuthService);
  });

  describe("signIn", () => {
    it("성공적으로 로그인/가입하고 토큰을 반환한다", async () => {
      const userResult = new UserResult(
        "1",
        "test@test.com",
        "Test",
        "KR",
        "USER",
        new Date(),
        new UserWalletResult("rAddress"),
      );
      userService.signIn.mockResolvedValue(userResult);
      authService.issueAccessToken.mockResolvedValue("access-token");

      const signInPayload = {
        email: "test@test.com",
        verifier: "google",
        verifierId: "sub-123",
        name: "Test",
        nationality: "KR",
        xrplAddress: "rAddress",
        publicKey: "02...",
      };

      const result = await facade.signIn(signInPayload);

      expect(result.id).toBe("1");
      expect(result.accessToken).toBe("access-token");
      expect(userService.signIn).toHaveBeenCalledWith(signInPayload);
      expect(authService.issueAccessToken).toHaveBeenCalledWith(
        BigInt(1),
        "test@test.com",
        "USER",
      );
    });
  });

  describe("logout", () => {
    it("성공 응답을 반환한다", async () => {
      authService.logout.mockResolvedValue(undefined);

      await expect(facade.logout(BigInt(1))).resolves.toBeUndefined();
      expect(authService.logout).toHaveBeenCalledWith(BigInt(1));
    });
  });
});
