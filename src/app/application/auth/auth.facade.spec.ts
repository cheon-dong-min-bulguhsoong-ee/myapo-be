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
            login: jest.fn(),
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

  describe("login", () => {
    it("성공적으로 로그인하고 토큰을 반환한다", async () => {
      const userResult = new UserResult(
        "1",
        "test@test.com",
        "Test",
        "KR",
        "USER",
        new Date(),
        new UserWalletResult("rAddress"),
      );
      userService.login.mockResolvedValue(userResult);
      authService.issueAccessToken.mockResolvedValue("access-token");

      const authPayload = {
        email: "test@test.com",
        verifier: "google",
        verifierId: "sub-123",
      };

      const result = await facade.login(authPayload);

      expect(result.id).toBe("1");
      expect(result.accessToken).toBe("access-token");
      expect(userService.login).toHaveBeenCalledWith(
        "google",
        "sub-123",
        "test@test.com",
      );
      expect(authService.issueAccessToken).toHaveBeenCalledWith(
        BigInt(1),
        "test@test.com",
        "USER",
      );
    });
  });

  describe("logout", () => {
    it("성공 응답을 반환한다", async () => {
      userService.login.mockResolvedValue({} as any); // Not used but for consistency
      authService.logout.mockResolvedValue(undefined);

      await expect(facade.logout(BigInt(1))).resolves.toBeUndefined();
      expect(authService.logout).toHaveBeenCalledWith(BigInt(1));
    });
  });
});
