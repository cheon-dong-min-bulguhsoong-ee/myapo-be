import { ApiProperty } from '@nestjs/swagger';
import { MyDataCategory } from '../../../domain/common/enum/mydata-category.enum';
import { CredentialBundleResult } from '../../../domain/issuer/dto/credential-bundle.result';
import { CredentialBundle } from '../../../domain/issuer/entity/credential-bundle.entity';
import { CredentialRequest } from '../../../domain/issuer/entity/credential-request.entity';
import { CredentialBundleStatus } from '../../../domain/issuer/enum/credential-bundle-status.enum';
import { CredentialRequestStatus } from '../../../domain/issuer/enum/credential-request-status.enum';
import { IssuerCode } from '../../../domain/issuer/enum/issuer-code.enum';

export class CredentialQueueItemRes {
  @ApiProperty({ example: 'Q-6102' })
  requestCode!: string;

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

  static from(entity: CredentialRequest): CredentialQueueItemRes {
    const res = new CredentialQueueItemRes();
    res.requestCode = entity.requestCode;
    res.issuerCode = entity.issuerCode;
    res.category = entity.category;
    res.status = entity.status;
    res.requestedAt = entity.requestedAt.toISOString();
    return res;
  }
}

export class CredentialBundleRes {
  @ApiProperty({ example: '5d3a2b9e-4f0c-4b0e-9e3c-2b1f4d6a8c7e' })
  bundleCode!: string;

  @ApiProperty({
    enum: CredentialBundleStatus,
    enumName: 'CredentialBundleStatus',
    example: CredentialBundleStatus.PENDING,
  })
  status!: CredentialBundleStatus;

  @ApiProperty({ example: 5 })
  totalCount!: number;

  @ApiProperty({ example: 0 })
  completedCount!: number;

  @ApiProperty({ example: 0 })
  failedCount!: number;

  @ApiProperty({ example: '2026-04-29T05:12:00.000Z' })
  requestedAt!: string;

  @ApiProperty({ type: () => CredentialQueueItemRes, isArray: true })
  queued!: CredentialQueueItemRes[];

  static from(result: CredentialBundleResult): CredentialBundleRes {
    const res = new CredentialBundleRes();
    const { bundle, requests } = result;
    res.bundleCode = bundle.bundleCode;
    res.status = bundle.status;
    res.totalCount = bundle.totalCount;
    res.completedCount = bundle.completedCount;
    res.failedCount = bundle.failedCount;
    res.requestedAt = bundle.requestedAt.toISOString();
    res.queued = requests.map(toQueueItem);
    return res;
  }
}

function toQueueItem(entity: CredentialRequest): CredentialQueueItemRes {
  return CredentialQueueItemRes.from(entity);
}
