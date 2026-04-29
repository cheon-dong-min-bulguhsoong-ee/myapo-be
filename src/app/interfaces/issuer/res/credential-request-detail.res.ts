import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MyDataCategory } from '../../../domain/common/enum/mydata-category.enum';
import { CredentialRequestDetailResult } from '../../../domain/issuer/dto/credential-request-detail.result';
import { CredentialRequestStatus } from '../../../domain/issuer/enum/credential-request-status.enum';
import { IssuerCode } from '../../../domain/issuer/enum/issuer-code.enum';

export class CredentialRequestDetailRes {
  @ApiProperty({ example: '1', description: 'credential_requests.id (string).' })
  requestCode!: string;

  @ApiProperty({
    enum: IssuerCode,
    enumName: 'IssuerCode',
    example: IssuerCode.MOJ,
  })
  issuerCode!: IssuerCode;

  @ApiPropertyOptional({
    example: 'rMOJDemoIssuerWalletAddrPlaceholder',
    nullable: true,
    description:
      '발급 기관(Issuer) 의 XRPL 지갑 주소. issuers 테이블의 wallet_address. issuer 미등록(첫 admin 가입 전) 이면 null.',
  })
  issuerWallet!: string | null;

  @ApiProperty({
    enum: MyDataCategory,
    enumName: 'MyDataCategory',
    example: MyDataCategory.VISA_STAY,
  })
  category!: MyDataCategory;

  @ApiProperty({
    example: '5649534153544159',
    description: 'XRPL CredentialCreate 의 CredentialType (category 를 hex 로 인코딩)',
  })
  credentialType!: string;

  @ApiProperty({
    enum: CredentialRequestStatus,
    enumName: 'CredentialRequestStatus',
    example: CredentialRequestStatus.PENDING,
  })
  status!: CredentialRequestStatus;

  @ApiProperty({ example: '1042', description: 'Holder users.id (BigInt → string)' })
  holderUserId!: string;

  @ApiPropertyOptional({ example: '투안', nullable: true })
  holderAlias!: string | null;

  @ApiProperty({ example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  holderWallet!: string;

  @ApiProperty({ example: '2026-04-21T14:19:02.000Z' })
  requestedAt!: string;

  @ApiPropertyOptional({ example: 12, nullable: true, description: '요청한 유효기간 (개월)' })
  requestedTtlMonths!: number | null;

  @ApiPropertyOptional({
    example: '2027-04-21T14:19:02.000Z',
    nullable: true,
    description: '요청 시점 + ttl 로 계산된 만료 예정 시각',
  })
  requestedExpiresAt!: string | null;

  @ApiPropertyOptional({
    example: '0x6863...c9f8',
    nullable: true,
    description: '발급 완료 시 sha256(raw payload) 의 hex',
  })
  payloadHash!: string | null;

  @ApiPropertyOptional({
    example: '2026-04-21T14:22:00.000Z',
    nullable: true,
    description: '발급(Tx 처리) 시각. PENDING 이면 null.',
  })
  issuedAt!: string | null;

  @ApiPropertyOptional({
    example: '2027-04-21T00:00:00.000Z',
    nullable: true,
    description: '실제 만료 시각 (issuedAt + ttl). 발급 전이면 null.',
  })
  expiresAt!: string | null;

  @ApiPropertyOptional({ example: '0x7a2e4c...9ff021', nullable: true })
  xrplTxHash!: string | null;

  @ApiPropertyOptional({ example: '3248108', nullable: true })
  xrplLedgerIndex!: string | null;

  @ApiPropertyOptional({ example: '2026-04-21T14:22:00.000Z', nullable: true })
  processedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  failureReason!: string | null;

  static from(result: CredentialRequestDetailResult): CredentialRequestDetailRes {
    const r = result.request;
    const res = new CredentialRequestDetailRes();
    res.requestCode = r.requestCode;
    res.issuerCode = r.issuerCode;
    res.issuerWallet = result.issuerWallet;
    res.category = r.category;
    res.credentialType = toHex(r.category);
    res.status = r.status;
    res.holderUserId = result.holderUserId.toString();
    res.holderAlias = result.holderAlias;
    res.holderWallet = result.holderXrplAddress;
    res.requestedAt = r.requestedAt.toISOString();
    res.requestedTtlMonths = r.requestedTtlMonths;
    res.requestedExpiresAt = addMonths(r.requestedAt, r.requestedTtlMonths);
    res.payloadHash = r.payloadHash;
    res.issuedAt = r.processedAt ? r.processedAt.toISOString() : null;
    res.expiresAt = r.processedAt
      ? addMonths(r.processedAt, r.requestedTtlMonths)
      : null;
    res.xrplTxHash = r.xrplTxHash;
    res.xrplLedgerIndex = r.xrplLedgerIndex
      ? r.xrplLedgerIndex.toString()
      : null;
    res.processedAt = r.processedAt ? r.processedAt.toISOString() : null;
    res.failureReason = r.failureReason;
    return res;
  }
}

function toHex(value: string): string {
  return Buffer.from(value, 'utf8').toString('hex').toUpperCase();
}

function addMonths(base: Date, months: number | null): string | null {
  if (months === null || months === undefined) {
    return null;
  }
  const next = new Date(base);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
}
