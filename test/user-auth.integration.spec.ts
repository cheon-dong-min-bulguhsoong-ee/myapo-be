import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/app/infrastructure/prisma/prisma.service";
import { Web3AuthGuard } from "../src/app/infrastructure/auth/guards/web3auth.guard";
import { ExecutionContext } from "@nestjs/common";

describe("User & Auth Integration", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockWeb3AuthPayload = {
    email: "test@example.com",
    verifier: "google",
    verifierId: "sub-123",
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(Web3AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.web3auth = mockWeb3AuthPayload;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean start
    await prisma.userWallet.deleteMany({ where: { verifierId: "sub-123" } });
    await prisma.user.deleteMany({ where: { email: "test@example.com" } });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.userWallet.deleteMany({ where: { verifierId: "sub-123" } });
    await prisma.user.deleteMany({ where: { email: "test@example.com" } });
    await app.close();
  });

  describe("POST /api/v1/users/register", () => {
    it("성공적으로 가입하고 201 응답과 액세스 토큰을 반환한다", async () => {
      const registerDto = {
        name: "Test User",
        nationality: "KR",
        xrplAddress: "rTestAddress123",
        publicKey: "02TESTPUBKEY",
      };

      const response = await request(app.getHttpServer())
        .post("/api/v1/users/register")
        .send(registerDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(mockWeb3AuthPayload.email);
      expect(response.body.data.accessToken).toBeDefined();

      // DB 확인
      const user = await prisma.user.findUnique({
        where: { email: mockWeb3AuthPayload.email },
        include: { userWallet: true },
      });
      expect(user).toBeDefined();
      expect(user?.name).toBe(registerDto.name);
      expect(user?.userWallet?.xrplAddress).toBe(registerDto.xrplAddress);
      expect(user?.lastLoginAt).not.toBeNull();
    });

    it("이미 가입된 소셜 계정인 경우 409 에러를 반환한다", async () => {
      const registerDto = {
        name: "Another User",
        nationality: "KR",
        xrplAddress: "rAnotherAddress",
        publicKey: "02ANOTHER",
      };

      const response = await request(app.getHttpServer())
        .post("/api/v1/users/register")
        .send(registerDto)
        .expect(409);

      expect(response.body.error.code).toBe("ERR_USER_VERIFIER_DUPLICATED");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("가입된 사용자가 로그인하면 201(성공)과 토큰을 반환한다", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.email).toBe(mockWeb3AuthPayload.email);
    });
  });

  describe("GET /api/v1/users/me", () => {
    it("유효한 토큰으로 내 정보를 조회한다", async () => {
      // 1. 로그인하여 토큰 획득
      const loginRes = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .expect(201);
      const token = loginRes.body.data.accessToken;

      // 2. 프로필 조회
      const response = await request(app.getHttpServer())
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(mockWeb3AuthPayload.email);
      expect(response.body.data.wallet.xrplAddress).toBe("rTestAddress123");
    });

    it("토큰이 없으면 401 에러를 반환한다", async () => {
      await request(app.getHttpServer()).get("/api/v1/users/me").expect(401);
    });
  });

  describe("DELETE /api/v1/users/me", () => {
    it("성공적으로 회원 탈퇴 처리를 한다", async () => {
      // 1. 로그인하여 토큰 획득
      const loginRes = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .expect(201);
      const token = loginRes.body.data.accessToken;

      // 2. 탈퇴 요청
      await request(app.getHttpServer())
        .delete("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      // 3. DB 상태 확인
      const user = await prisma.user.findUnique({
        where: { email: mockWeb3AuthPayload.email },
      });
      expect(user?.isDelete).toBe(true);
    });

    it("탈퇴한 계정으로 로그인 시도 시 404 에러를 반환한다", async () => {
      const loginRes = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .expect(404);

      expect(loginRes.body.success).toBe(false);
      expect(loginRes.body.error.code).toBe("ERR_USER_NOT_FOUND");
    });
  });
});
