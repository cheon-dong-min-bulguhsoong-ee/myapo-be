import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MyDataCategory } from '../../../domain/common/enum/mydata-category.enum';
import { CredentialQueueResult } from '../../../domain/issuer/dto/credential-queue.result';
import { CredentialRequestStatus } from '../../../domain/issuer/enum/credential-request-status.enum';
import { IssuerCode } from '../../../domain/issuer/enum/issuer-code.enum';
import { CredentialQueueRow } from '../../../domain/issuer/repository/credential-request.repository';

export class CredentialQueueStatsRes {
  @ApiProperty({ example: 7, description: '대기 (PENDING) 누적' })
  pending!: number;

  @ApiProperty({ example: 214, description: '발급 완료 (COMPLETED) 누적' })
  completed!: number;

  @ApiProperty({ example: 2, description: '24시간 내 실패 (FAILED)' })
  failed24h!: number;

  @ApiProperty({ example: 11, description: '폐기 (REVOKED) 누적' })
  revoked!: number;
}

export class CredentialQueueItemRes {
  @ApiProperty({ example: 'Q-6102' })
  requestCode!: string;

  @ApiProperty({ example: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' })
  holderWallet!: string;

  @ApiProperty({
    enum: IssuerCode,
    enumName: 'IssuerCode',
    example: IssuerCode.MOJ,
  })
  issuerCode!: IssuerCode;

  @ApiProperty({
    enum: MyDataCategory,
    enumName: 'MyDataCategory',
    example: MyDataCategory.VISA_STAY,
  })
  category!: MyDataCategory;

  @ApiProperty({
    enum: CredentialRequestStatus,
    enumName: 'CredentialRequestStatus',
    example: CredentialRequestStatus.PENDING,
  })
  status!: CredentialRequestStatus;

  @ApiProperty({ example: '2026-04-29T05:12:00.000Z' })
  requestedAt!: string;

  @ApiPropertyOptional({
    example: '2026-04-29T05:14:01.000Z',
    description: 'COMPLETED/FAILED 처리 시각',
    nullable: true,
  })
  processedAt!: string | null;

  @ApiPropertyOptional({ example: '0x7a2e...9c31', nullable: true })
  xrplTxHash!: string | null;

  @ApiPropertyOptional({ nullable: true })
  failureReason!: string | null;

  static from(row: CredentialQueueRow): CredentialQueueItemRes {
    const res = new CredentialQueueItemRes();
    const r = row.request;
    res.requestCode = r.requestCode;
    res.holderWallet = row.holderWallet;
    res.issuerCode = r.issuerCode;
    res.category = r.category;
    res.status = r.status;
    res.requestedAt = r.requestedAt.toISOString();
    res.processedAt = r.processedAt ? r.processedAt.toISOString() : null;
    res.xrplTxHash = r.xrplTxHash;
    res.failureReason = r.failureReason;
    return res;
  }
}

export class CredentialQueueRes {
  @ApiProperty({ type: () => CredentialQueueStatsRes })
  stats!: CredentialQueueStatsRes;

  @ApiProperty({ type: () => CredentialQueueItemRes, isArray: true })
  items!: CredentialQueueItemRes[];

  @ApiProperty({ example: 1, description: '현재 페이지 (1부터)' })
  page!: number;

  @ApiProperty({ example: 20, description: '페이지 크기' })
  limit!: number;

  @ApiProperty({ example: 7, description: '필터 조건의 전체 건수' })
  total!: number;

  @ApiProperty({ example: 1, description: '전체 페이지 수' })
  totalPages!: number;

  @ApiProperty({ example: false, description: '다음 페이지 존재 여부' })
  hasNext!: boolean;

  static from(result: CredentialQueueResult): CredentialQueueRes {
    const res = new CredentialQueueRes();
    res.stats = {
      pending: result.stats.pending,
      completed: result.stats.completed,
      failed24h: result.stats.failed24h,
      revoked: result.stats.revoked,
    };
    res.items = result.rows.map((row) => CredentialQueueItemRes.from(row));
    res.page = result.page;
    res.limit = result.limit;
    res.total = result.total;
    res.totalPages = Math.max(1, Math.ceil(result.total / result.limit));
    res.hasNext = result.page < res.totalPages;
    return res;
  }
}
