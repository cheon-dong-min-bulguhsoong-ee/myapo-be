import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { DomainError } from "../../../domain/common/error/domain.error";
import { ErrorCode } from "../../../domain/common/error/error-code";

interface DecodedToken extends jwt.JwtPayload {
  email?: string;
  sub?: string;
  aud?: string;
  iss?: string;
  verifier?: string;
  verifierId?: string;
}

@Injectable()
export class Web3AuthGuard implements CanActivate {
  private googleClient: jwksClient.JwksClient;
  private web3authClient: jwksClient.JwksClient;
  private readonly googleOauthClientId: string;
  private readonly web3authClientId: string;

  private readonly GOOGLE_ISSUER = "https://accounts.google.com";
  private readonly WEB3AUTH_ISSUER = "https://api-auth.web3auth.io";

  constructor(private readonly configService: ConfigService) {
    this.googleClient = jwksClient({
      jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
      cache: true,
      rateLimit: true,
    });
    this.web3authClient = jwksClient({
      jwksUri: "https://api-auth.web3auth.io/jwks",
      cache: true,
      rateLimit: true,
    });

    this.googleOauthClientId = this.configService.get<string>(
      "GOOGLE_OAUTH_CLIENT_ID",
    )!;
    this.web3authClientId =
      this.configService.get<string>("WEB3AUTH_CLIENT_ID")!;

    if (!this.googleOauthClientId && !this.web3authClientId) {
      throw new Error(
        "Neither GOOGLE_OAUTH_CLIENT_ID nor WEB3AUTH_CLIENT_ID is defined in environment variables.",
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new DomainError(ErrorCode.Auth.UNAUTHORIZED, {
        message: "Missing or invalid Authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decodedToken = await this.verifyToken(token);

      const iss = decodedToken.iss;
      const aud = decodedToken.aud;

      if (iss === this.GOOGLE_ISSUER) {
        if (aud !== this.googleOauthClientId) {
          throw new DomainError(ErrorCode.Auth.TOKEN_INVALID, {
            message: "Invalid token audience (aud) claim for Google.",
            expectedAud: this.googleOauthClientId,
            receivedAud: aud,
          });
        }

        (request as any).web3auth = {
          email: decodedToken.email,
          verifier: "google",
          verifierId: decodedToken.sub,
        };
      } else if (iss === this.WEB3AUTH_ISSUER) {
        if (aud !== this.web3authClientId) {
          throw new DomainError(ErrorCode.Auth.TOKEN_INVALID, {
            message: "Invalid token audience (aud) claim for Web3Auth.",
            expectedAud: this.web3authClientId,
            receivedAud: aud,
          });
        }

        (request as any).web3auth = {
          email: decodedToken.email,
          verifier: decodedToken.verifier || "web3auth",
          verifierId: decodedToken.verifierId || decodedToken.email,
        };
      } else {
        throw new DomainError(ErrorCode.Auth.TOKEN_INVALID, {
          message: `Unsupported token issuer: ${iss}`,
        });
      }

      return true;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError
      ) {
        throw new DomainError(ErrorCode.Auth.TOKEN_INVALID, {
          message: error.message,
          name: error.name,
        });
      }
      throw new DomainError(ErrorCode.Common.BAD_REQUEST, {
        message: "Invalid Web3Auth token",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async verifyToken(token: string): Promise<DecodedToken> {
    const decodedUnverified = jwt.decode(token, { complete: true });
    if (!decodedUnverified || typeof decodedUnverified === "string") {
      throw new Error("Invalid token format");
    }

    const { payload } = decodedUnverified;
    const iss = (payload as any).iss;

    let client: jwksClient.JwksClient;
    let algorithms: jwt.Algorithm[];

    if (iss === this.GOOGLE_ISSUER) {
      client = this.googleClient;
      algorithms = ["RS256"];
    } else if (iss === this.WEB3AUTH_ISSUER) {
      client = this.web3authClient;
      algorithms = ["ES256"];
    } else {
      throw new Error(`Unsupported token issuer: ${iss}`);
    }

    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        (header, callback) => {
          client.getSigningKey(header.kid, (err, key) => {
            if (err) {
              callback(err);
            } else {
              callback(null, key?.getPublicKey());
            }
          });
        },
        { algorithms },
        (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded as DecodedToken);
        },
      );
    });
  }
}
