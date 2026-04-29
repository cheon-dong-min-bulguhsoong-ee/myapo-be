import { ApiProperty } from '@nestjs/swagger';
import { IssuerAuthResult } from '../../../domain/issuer/dto/issuer-auth.result';
import { IssuerCode } from '../../../domain/issuer/enum/issuer-code.enum';

class IssuerSummary {
  @ApiProperty({ enum: IssuerCode, enumName: 'IssuerCode', example: IssuerCode.MOJ })
  public readonly code: IssuerCode;

  @ApiProperty({ example: '법무부' })
  public readonly name: string;

  @ApiProperty({ example: 'rMOJDemoIssuerWalletAddrPlaceholder' })
  public readonly walletAddress: string;

  @ApiProperty({ example: 'MOJ-ADMIN-01' })
  public readonly adminId: string;

  @ApiProperty({ example: 'ACTIVE' })
  public readonly status: string;

  constructor(
    code: IssuerCode,
    name: string,
    walletAddress: string,
    adminId: string,
    status: string,
  ) {
    this.code = code;
    this.name = name;
    this.walletAddress = walletAddress;
    this.adminId = adminId;
    this.status = status;
  }
}

export class IssuerAuthRes {
  @ApiProperty({ example: 'eyJhZG1pbklkIjoiTU9KLUFETUlOLTAxIn0.AbCdEf' })
  public readonly accessToken: string;

  @ApiProperty({ example: '2026-04-29T02:30:00.000Z' })
  public readonly expiresAt: string;

  @ApiProperty({ type: () => IssuerSummary })
  public readonly issuer: IssuerSummary;

  constructor(accessToken: string, expiresAt: string, issuer: IssuerSummary) {
    this.accessToken = accessToken;
    this.expiresAt = expiresAt;
    this.issuer = issuer;
  }

  static from(result: IssuerAuthResult): IssuerAuthRes {
    return new IssuerAuthRes(
      result.token,
      result.expiresAt.toISOString(),
      new IssuerSummary(
        result.issuer.code,
        result.issuer.name,
        result.issuer.walletAddress,
        result.issuer.adminId,
        result.issuer.status,
      ),
    );
  }
}
