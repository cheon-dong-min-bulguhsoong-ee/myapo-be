import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { DomainError } from "../../common/error/domain.error";
import { ErrorCode } from "../../common/error/error-code";
import { AdvanceDocumentMvpResult } from "../dto/advance-document-mvp.result";
import { CreateDocumentMvpResult } from "../dto/create-document-mvp.result";
import { DocumentMvpDetailResult } from "../dto/document-mvp-detail.result";
import { DocumentMvpListResult } from "../dto/document-mvp-list-item.result";
import { toMvpRawStagePdfUrl } from "../dto/mvp-pdf-key";
import { DocumentMvpStageStatus } from "../enum/document-mvp-stage-status.enum";
import { DocumentMvpStage } from "../enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../enum/document-mvp-status.enum";
import {
  CreateMvpStageEventInput,
  DocumentMvpRepository,
} from "../repository/document-mvp.repository";

/**
 * 문서 발급 MVP 도메인 서비스.
 *
 * 기존 documents 도메인의 복잡한 XRPL/credential 연동을 빼고, 5단계 파이프라인 + 사용자 advance 만 다룬다.
 *
 * Mock 흐름 요약:
 *   POST /document-mvp 1회 →
 *     stage 1 (AUTHORITY_DOC_ISSUED) PENDING — current_stage 로 시작.
 *
 *   POST /document-mvp/:code/advance 호출마다 한 단계씩 전진:
 *     AUTHORITY_DOC_ISSUED → TRANSLATOR_DOC_RECEIVED → TRANSLATOR_DOC_NOTARIZED → APOSTILLE_DOC_ISSUED.
 *
 *   마지막 advance 호출로 APOSTILLE_DOC_ISSUED DONE + status=VALID, issuedAt 채움.
 */
@Injectable()
export class DocumentMvpService {
  constructor(private readonly repository: DocumentMvpRepository) {}

  /**
   * 문서 발급 신청.
   */
  async create(
    userId: bigint,
    documentTypeCode: string,
  ): Promise<CreateDocumentMvpResult> {
    const now = new Date();

    const seededStages: CreateMvpStageEventInput[] = [
      {
        documentId: BigInt(0),
        stage: DocumentMvpStage.AUTHORITY_DOC_ISSUED,
        status: DocumentMvpStageStatus.PENDING,
        startedAt: now,
        completedAt: null,
        s3ObjectKey: toMvpRawStagePdfUrl(
          documentTypeCode,
          DocumentMvpStage.AUTHORITY_DOC_ISSUED,
        ),
      },
    ];

    const document = await this.repository.createWithSeedStages(
      {
        documentCode: randomUUID(),
        userId,
        documentTypeCode,
        status: DocumentMvpStatus.AWAITING_USER_APPROVAL,
        currentStage: DocumentMvpStage.AUTHORITY_DOC_ISSUED,
        requestedAt: now,
      },
      seededStages,
    );

    return new CreateDocumentMvpResult(
      document.documentCode,
      document.documentTypeCode,
      document.status,
      document.currentStage,
      document.requestedAt,
    );
  }

  /**
   * 다음 FE step 으로 전이 — advance 1회 = step 한 칸 이동.
   *
   * 신청 직후 (AUTHORITY_DOC_ISSUED PENDING) →
   *   advance 1회 (step 2) → 2회 (step 3) → 3회 (step 4 = VALID) → 4회 (INSTITUTION_DOC_SUBMIT 후속).
   *
   * 시나리오 1: current_stage = AUTHORITY_DOC_ISSUED (step 1 진행 중)
   *   - AUTHORITY_DOC_ISSUED PENDING → DONE 마감
   *   - TRANSLATOR_DOC_RECEIVED PENDING 신규 INSERT (step 2 시작)
   *   - documents.current_stage = TRANSLATOR_DOC_RECEIVED
   *
   * 시나리오 2: current_stage = TRANSLATOR_DOC_RECEIVED (step 2 진행 중)
   *   - TRANSLATOR_DOC_RECEIVED PENDING → DONE 마감
   *   - TRANSLATOR_DOC_NOTARIZED DONE 신규 INSERT (step 2 안에 묶인 sub-stage, 동시에 자동 완료)
   *   - APOSTILLE_DOC_ISSUED PENDING 신규 INSERT (step 3 시작)
   *   - documents.current_stage = APOSTILLE_DOC_ISSUED
   *
   * 시나리오 3: current_stage = APOSTILLE_DOC_ISSUED (step 3 진행 중, status != VALID)
   *   - APOSTILLE_DOC_ISSUED PENDING → DONE 마감
   *   - documents.status = VALID, issuedAt = now (current_stage 그대로)
   *
   * 시나리오 4: status = VALID & current_stage = APOSTILLE_DOC_ISSUED (파이프라인 종료 후 기관 제출 후속)
   *   - INSTITUTION_DOC_SUBMIT DONE 신규 INSERT (`5-{문서명}_기관제출.pdf` s3_object_key)
   *   - documents.current_stage = INSTITUTION_DOC_SUBMIT (status=VALID 유지)
   *
   * status=VALID & current_stage=INSTITUTION_DOC_SUBMIT 면 진짜 마지막 — 거부.
   * 그 외 stage (TRANSLATOR_DOC_NOTARIZED) 가 current_stage 인 경우는 비정상 — 거부.
   */
  async advance(
    userId: bigint,
    documentCode: string,
  ): Promise<AdvanceDocumentMvpResult> {
    const document = await this.repository.findByCode(documentCode);
    if (document === null) {
      throw new DomainError(ErrorCode.Document.NOT_FOUND, { documentCode });
    }
    if (document.userId !== userId) {
      throw new DomainError(ErrorCode.Document.NOT_OWNED, { documentCode });
    }

    // 파이프라인 종료(status=VALID) 후 한 번 더 advance 로 INSTITUTION_DOC_SUBMIT 후속 이벤트를 기록한다.
    // 이미 INSTITUTION_DOC_SUBMIT 까지 도달했으면 진짜 마지막 — 거부.
    if (
      document.status === DocumentMvpStatus.VALID &&
      document.currentStage === DocumentMvpStage.INSTITUTION_DOC_SUBMIT
    ) {
      throw new DomainError(ErrorCode.Document.ALREADY_FINAL_STAGE, {
        documentCode,
        currentStage: document.currentStage,
      });
    }

    const now = new Date();

    if (
      document.status === DocumentMvpStatus.VALID &&
      document.currentStage === DocumentMvpStage.APOSTILLE_DOC_ISSUED
    ) {
      // step 4 종료 후 기관 제출 이벤트 — `5-{문서명}_기관제출.pdf` 를 stage 로 기록.
      // ORDERED_MVP_STAGES 미포함이라 detail 응답의 stages[]/uiSteps[] 에는 노출되지 않음.
      await this.repository.createStageEvent({
        documentId: document.id,
        stage: DocumentMvpStage.INSTITUTION_DOC_SUBMIT,
        status: DocumentMvpStageStatus.DONE,
        startedAt: now,
        completedAt: now,
        s3ObjectKey: toMvpRawStagePdfUrl(
          document.documentTypeCode,
          DocumentMvpStage.INSTITUTION_DOC_SUBMIT,
        ),
      });
      const updated = await this.repository.updateStage(document.id, {
        currentStage: DocumentMvpStage.INSTITUTION_DOC_SUBMIT,
        status: DocumentMvpStatus.VALID,
        issuedAt: document.issuedAt,
      });
      return new AdvanceDocumentMvpResult(
        updated.documentCode,
        updated.currentStage,
        updated.status,
        updated.issuedAt,
      );
    }

    if (document.currentStage === DocumentMvpStage.AUTHORITY_DOC_ISSUED) {
      // step 1 → step 2 (기관 발급 → 번역·공증)
      await this.repository.completePendingStage(
        document.id,
        DocumentMvpStage.AUTHORITY_DOC_ISSUED,
        now,
      );
      // step 2 진입.
      await this.repository.createStageEvent({
        documentId: document.id,
        stage: DocumentMvpStage.TRANSLATOR_DOC_RECEIVED,
        status: DocumentMvpStageStatus.PENDING,
        startedAt: now,
        completedAt: null,
        s3ObjectKey: toMvpRawStagePdfUrl(
          document.documentTypeCode,
          DocumentMvpStage.TRANSLATOR_DOC_RECEIVED,
        ),
      });
      const updated = await this.repository.updateStage(document.id, {
        currentStage: DocumentMvpStage.TRANSLATOR_DOC_RECEIVED,
        status: DocumentMvpStatus.AWAITING_USER_APPROVAL,
        issuedAt: null,
      });
      return new AdvanceDocumentMvpResult(
        updated.documentCode,
        updated.currentStage,
        updated.status,
        updated.issuedAt,
      );
    }

    if (document.currentStage === DocumentMvpStage.TRANSLATOR_DOC_RECEIVED) {
      // step 2 → step 3 (번역·공증 → 아포스티유)
      await this.repository.completePendingStage(
        document.id,
        DocumentMvpStage.TRANSLATOR_DOC_RECEIVED,
        now,
      );
      // step 2 안에 묶인 sub-stage: 자동으로 동시에 완료 처리.
      await this.repository.createStageEvent({
        documentId: document.id,
        stage: DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED,
        status: DocumentMvpStageStatus.DONE,
        startedAt: now,
        completedAt: now,
        s3ObjectKey: toMvpRawStagePdfUrl(
          document.documentTypeCode,
          DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED,
        ),
      });
      // step 3 진입.
      await this.repository.createStageEvent({
        documentId: document.id,
        stage: DocumentMvpStage.APOSTILLE_DOC_ISSUED,
        status: DocumentMvpStageStatus.PENDING,
        startedAt: now,
        completedAt: null,
        s3ObjectKey: toMvpRawStagePdfUrl(
          document.documentTypeCode,
          DocumentMvpStage.APOSTILLE_DOC_ISSUED,
        ),
      });
      const updated = await this.repository.updateStage(document.id, {
        currentStage: DocumentMvpStage.APOSTILLE_DOC_ISSUED,
        status: DocumentMvpStatus.AWAITING_USER_APPROVAL,
        issuedAt: null,
      });
      return new AdvanceDocumentMvpResult(
        updated.documentCode,
        updated.currentStage,
        updated.status,
        updated.issuedAt,
      );
    }

    if (document.currentStage === DocumentMvpStage.APOSTILLE_DOC_ISSUED) {
      // step 3 → step 4 (아포스티유 → 발급 완료, 파이프라인 종료)
      await this.repository.completePendingStage(
        document.id,
        DocumentMvpStage.APOSTILLE_DOC_ISSUED,
        now,
      );
      const updated = await this.repository.updateStage(document.id, {
        currentStage: DocumentMvpStage.APOSTILLE_DOC_ISSUED,
        status: DocumentMvpStatus.VALID,
        issuedAt: now,
      });
      return new AdvanceDocumentMvpResult(
        updated.documentCode,
        updated.currentStage,
        updated.status,
        updated.issuedAt,
      );
    }

    // USER/AUTHORITY/TRANS_NOTARIZED 가 current_stage 인 건 비정상.
    throw new DomainError(ErrorCode.Document.ALREADY_FINAL_STAGE, {
      documentCode,
      currentStage: document.currentStage,
    });
  }

  async findDetail(documentCode: string): Promise<DocumentMvpDetailResult> {
    const detail = await this.repository.findDetailByCode(documentCode);
    if (detail === null) {
      throw new DomainError(ErrorCode.Document.NOT_FOUND, { documentCode });
    }
    return detail;
  }

  async findListByUser(userId: bigint): Promise<DocumentMvpListResult> {
    const items = await this.repository.findListByUser({ userId });
    return new DocumentMvpListResult(items, items.length);
  }
}
