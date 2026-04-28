import { ApiProperty } from '@nestjs/swagger';
import { IssuerAuthResult } from '../../../domain/issuer/dto/issuer-auth.result';
import { IssuerCode } from '../../../domain/issuer/enum/issuer-code.enum';

class IssuerAdminSummary {
  @ApiProperty({ example: '1' })
  public readonly id: string;

  @ApiProperty({ enum: IssuerCode, enumName: 'IssuerCode', example: IssuerCode.MOJ })
  public readonly issuerCode: IssuerCode;

  @ApiProperty({ example: 'MOJ-ADMIN-01' })
  public readonly adminId: string;

  @ApiProperty({ example: 'ACTIVE' })
  public readonly status: string;

  constructor(id: string, issuerCode: IssuerCode, adminId: string, status: string) {
    this.id = id;
    this.issuerCode = issuerCode;
    this.adminId = adminId;
    this.status = status;
  }
}

export class IssuerAuthRes {
  @ApiProperty({ example: 'eyJhZG1pbklkIjoiTU9KLUFETUlOLTAxIn0.AbCdEf' })
  public readonly accessToken: string;

  @ApiProperty({ example: '2026-04-29T02:30:00.000Z' })
  public readonly expiresAt: string;

  @ApiProperty({ type: () => IssuerAdminSummary })
  public readonly admin: IssuerAdminSummary;

  constructor(accessToken: string, expiresAt: string, admin: IssuerAdminSummary) {
    this.accessToken = accessToken;
    this.expiresAt = expiresAt;
    this.admin = admin;
  }

  static from(result: IssuerAuthResult): IssuerAuthRes {
    return new IssuerAuthRes(
      result.token,
      result.expiresAt.toISOString(),
      new IssuerAdminSummary(
        result.admin.id.toString(),
        result.admin.issuerCode,
        result.admin.adminId,
        result.admin.status,
      ),
    );
  }
}