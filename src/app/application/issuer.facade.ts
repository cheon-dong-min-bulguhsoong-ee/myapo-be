import { Injectable, Logger } from '@nestjs/common';
import { ApiException } from '../interfaces/exception/api-exception';
import { ExceptionCode } from '../interfaces/exception/exception-code';
import { CredentialIssuanceService } from '../domain/issuer/credential-issuance.service';
import { IssuanceBundleResult } from '../domain/issuer/issuance-bundle.result';
import { IssuanceResultItem } from '../domain/issuer/issuance-result-item';
import {
  IssuerAuthError,
  IssuerAuthErrorReason,
} from '../domain/issuer/issuer-auth.error';
import { IssuerAuthResult } from '../domain/issuer/issuer-auth.result';
import { IssuerAuthService } from '../domain/issuer/issuer-auth.service';
import { IssuerCode } from '../domain/issuer/issuer-code.enum';
import {
  MYDATA_CATEGORIES,
  MyDataCategory,
} from '../domain/common/mydata-category.enum';
import { MyDataSnapshot } from '../domain/mydata/mydata-snapshot.entity';
import { MyDataService } from '../domain/mydata/mydata.service';
import { User } from '../domain/user/user.entity';
import { UserService } from '../domain/user/user.service';
import { XrplCredentialService } from '../domain/xrpl/xrpl-credential.service';
import { XrplTransactionService } from '../domain/xrpl/xrpl-transaction.service';

@Injectable()
export class IssuerFacade {
  private readonly logger = new Logger(IssuerFacade.name);

  constructor(
    private readonly issuerAuthService: IssuerAuthService,
    private readonly credentialIssuanceService: CredentialIssuanceService,
    private readonly userService: UserService,
    private readonly mydataService: MyDataService,
    private readonly xrplCredentialService: XrplCredentialService,
    private readonly xrplTransactionService: XrplTransactionService,
  ) {}

  signup(
    issuerCode: IssuerCode,
    adminId: string,
    password: string,
  ): Promise<IssuerAuthResult> {
    return this.mapIssuerAuthError(() =>
      this.issuerAuthService.signup(issuerCode, adminId, password),
    );
  }

  login(
    issuerCode: IssuerCode,
    adminId: string,
    password: string,
  ): Promise<IssuerAuthResult> {
    return this.mapIssuerAuthError(() =>
      this.issuerAuthService.login(issuerCode, adminId, password),
    );
  }

  async issueBundle(xrplAddress: string): Promise<IssuanceBundleResult> {
    const user = await this.loadActiveUser(xrplAddress);
    const snapshotMap = await this.mydataService.findLatestByUserId(user.id);
    this.assertAtLeastOneSnapshot(user.id, snapshotMap);

    const items: IssuanceResultItem[] = [];
    for (const category of MYDATA_CATEGORIES) {
      items.push(await this.issueOneCategory(user, category, snapshotMap));
    }
    return new IssuanceBundleResult(user.id, user.xrplAddress, items);
  }

  private assertAtLeastOneSnapshot(
    userId: bigint,
    snapshotMap: Map<MyDataCategory, MyDataSnapshot>,
  ): void {
    const missing: MyDataCategory[] = [];
    for (const category of MYDATA_CATEGORIES) {
      if (!snapshotMap.has(category)) {
        missing.push(category);
      }
    }
    if (missing.length === MYDATA_CATEGORIES.length) {
      throw new ApiException(ExceptionCode.MyData.SNAPSHOT_MISSING, {
        userId: userId.toString(),
        missing,
      });
    }
  }

  private async issueOneCategory(
    user: User,
    category: MyDataCategory,
    snapshotMap: Map<MyDataCategory, MyDataSnapshot>,
  ): Promise<IssuanceResultItem> {
    const snapshot = snapshotMap.get(category);
    if (snapshot === undefined) {
      return IssuanceResultItem.skipped(category, 'snapshot missing');
    }
    try {
      const expiresAt = this.credentialIssuanceService.createDefaultExpiresAt();
      const metadataUri = this.credentialIssuanceService.createMetadataUri(
        snapshot.category,
        snapshot.dataHash,
      );
      const txResult = await this.xrplCredentialService.issueCredential(
        user.xrplAddress,
        snapshot.category,
        snapshot.dataHash,
        metadataUri,
        expiresAt,
      );
      await this.xrplTransactionService.recordCredentialCreate(
        user.id,
        user.xrplAddress,
        user.xrplAddress,
        txResult,
      );
      const credential = await this.credentialIssuanceService.recordIssued({
        userId: user.id,
        snapshotId: snapshot.id,
        category: snapshot.category,
        dataHash: snapshot.dataHash,
        xrplTxHash: txResult.txHash,
        metadataUri,
        issuedAt: new Date(),
        expiresAt,
      });
      return IssuanceResultItem.issued(
        category,
        credential.xrplTxHash,
        'tesSUCCESS',
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(`issue ${category} failed: ${reason}`);
      return IssuanceResultItem.failed(category, reason);
    }
  }

  private async loadActiveUser(xrplAddress: string): Promise<User> {
    const user = await this.userService.findByXrplAddress(xrplAddress);
    if (user === null) {
      throw new ApiException(ExceptionCode.User.USER_NOT_FOUND, {
        xrplAddress,
      });
    }
    if (!user.isActive()) {
      throw new ApiException(ExceptionCode.User.USER_NOT_ACTIVE, {
        userId: user.id.toString(),
        status: user.status,
      });
    }
    return user;
  }

  private async mapIssuerAuthError<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof IssuerAuthError)) {
        throw error;
      }
      if (error.reason === IssuerAuthErrorReason.ADMIN_ALREADY_EXISTS) {
        throw new ApiException(
          ExceptionCode.Issuer.ADMIN_ALREADY_EXISTS,
          error.data,
        );
      }
      if (error.reason === IssuerAuthErrorReason.ADMIN_INACTIVE) {
        throw new ApiException(ExceptionCode.Issuer.ADMIN_INACTIVE, error.data);
      }
      throw new ApiException(ExceptionCode.Issuer.INVALID_CREDENTIALS);
    }
  }
}
