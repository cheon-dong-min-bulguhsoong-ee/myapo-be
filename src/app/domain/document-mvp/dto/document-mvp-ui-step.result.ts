import {
  DOCUMENT_MVP_STAGE_STATUS_LABELS,
  DocumentMvpStageStatus,
} from "../enum/document-mvp-stage-status.enum";
import { DocumentMvpStage } from "../enum/document-mvp-stage.enum";
import { DocumentMvpStatus } from "../enum/document-mvp-status.enum";
import { DocumentMvpStageDetail } from "./document-mvp-detail.result";
import { toMvpStepPdfUrl } from "./mvp-pdf-key";

/**
 * FE history/app-1 화면이 보여주는 4단계 step. BE 의 5 raw stage 를 묶어서 만든다.
 *
 *   step 1 "발급 신청"   ← USER_DOC_REQUESTED + AUTHORITY_DOC_ISSUED
 *   step 2 "번역·공증"   ← TRANSLATOR_DOC_RECEIVED + TRANSLATOR_DOC_NOTARIZED
 *   step 3 "아포스티유"  ← APOSTILLE_DOC_ISSUED
 *   step 4 "발급 완료"   ← status=VALID 도달
 *
 * status 종합 규칙:
 *   - sub-stage 중 하나라도 FAILED → FAILED
 *   - 모두 DONE → DONE
 *   - 일부 시작(DONE 또는 PENDING) → PENDING (= 진행 중)
 *   - 모두 미시작 → null
 */
export class DocumentMvpUiStepResult {
  constructor(
    public readonly step: number,
    public readonly label: string,
    public readonly status: DocumentMvpStageStatus | null,
    public readonly statusLabel: string | null,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly pdfUrl: string | null,
  ) {}
}

/**
 * 5개 raw stage + 전체 status 를 받아 FE 4단계 step 으로 변환.
 */
export const toUiSteps = (
  stages: DocumentMvpStageDetail[],
  status: DocumentMvpStatus,
  issuedAt: Date | null,
  documentTypeCode: string,
): DocumentMvpUiStepResult[] => {
  const map = new Map(stages.map((s) => [s.stage, s]));
  const user = map.get(DocumentMvpStage.USER_DOC_REQUESTED);
  const authority = map.get(DocumentMvpStage.AUTHORITY_DOC_ISSUED);
  const transReceived = map.get(DocumentMvpStage.TRANSLATOR_DOC_RECEIVED);
  const transNotarized = map.get(DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED);
  const apostille = map.get(DocumentMvpStage.APOSTILLE_DOC_ISSUED);

  const step1 = mergeSubStages(
    1,
    "발급 신청",
    [user, authority],
    toMvpStepPdfUrl(documentTypeCode, 1),
  );
  const step2 = mergeSubStages(
    2,
    "번역·공증",
    [transReceived, transNotarized],
    toMvpStepPdfUrl(documentTypeCode, 2),
  );
  const step3 = mergeSubStages(
    3,
    "아포스티유",
    [apostille],
    toMvpStepPdfUrl(documentTypeCode, 3),
  );
  const step4 = buildFinalStep(status, issuedAt);

  return [step1, step2, step3, step4];
};

const mergeSubStages = (
  step: number,
  label: string,
  subs: Array<DocumentMvpStageDetail | undefined>,
  pdfUrl: string | null,
): DocumentMvpUiStepResult => {
  // repo 가 5개 stage 슬롯을 다 채워서 보내므로 undefined 가 아니라
  // status=null 객체로 "미시작" 이 표현된다 — status=null 도 미시작으로 간주.
  const started = subs.filter(
    (s): s is DocumentMvpStageDetail => s !== undefined && s.status !== null,
  );

  if (started.length === 0) {
    return new DocumentMvpUiStepResult(
      step,
      label,
      null,
      null,
      null,
      null,
      pdfUrl,
    );
  }

  if (started.some((s) => s.status === DocumentMvpStageStatus.FAILED)) {
    const failed = started.find(
      (s) => s.status === DocumentMvpStageStatus.FAILED,
    )!;
    return new DocumentMvpUiStepResult(
      step,
      label,
      DocumentMvpStageStatus.FAILED,
      DOCUMENT_MVP_STAGE_STATUS_LABELS[DocumentMvpStageStatus.FAILED],
      earliestStartedAt(started),
      failed.completedAt,
      pdfUrl,
    );
  }

  // sub-stage "전부" DONE 이어야 step DONE — undefined / status=null 슬롯이 있으면 진행 중.
  const allDone =
    started.length === subs.length &&
    started.every((s) => s.status === DocumentMvpStageStatus.DONE);

  if (allDone) {
    return new DocumentMvpUiStepResult(
      step,
      label,
      DocumentMvpStageStatus.DONE,
      DOCUMENT_MVP_STAGE_STATUS_LABELS[DocumentMvpStageStatus.DONE],
      earliestStartedAt(started),
      latestCompletedAt(started),
      pdfUrl,
    );
  }

  // 일부만 시작/완료된 상태 — 진행 중.
  return new DocumentMvpUiStepResult(
    step,
    label,
    DocumentMvpStageStatus.PENDING,
    DOCUMENT_MVP_STAGE_STATUS_LABELS[DocumentMvpStageStatus.PENDING],
    earliestStartedAt(started),
    null,
    pdfUrl,
  );
};

const buildFinalStep = (
  status: DocumentMvpStatus,
  issuedAt: Date | null,
): DocumentMvpUiStepResult => {
  const label = "발급 완료";
  if (status === DocumentMvpStatus.VALID) {
    return new DocumentMvpUiStepResult(
      4,
      label,
      DocumentMvpStageStatus.DONE,
      DOCUMENT_MVP_STAGE_STATUS_LABELS[DocumentMvpStageStatus.DONE],
      issuedAt,
      issuedAt,
      null,
    );
  }
  if (status === DocumentMvpStatus.FAILED) {
    return new DocumentMvpUiStepResult(
      4,
      label,
      DocumentMvpStageStatus.FAILED,
      DOCUMENT_MVP_STAGE_STATUS_LABELS[DocumentMvpStageStatus.FAILED],
      null,
      null,
      null,
    );
  }
  return new DocumentMvpUiStepResult(4, label, null, null, null, null, null);
};

/**
 * list 응답용 — currentStage + status 만 보고 "지금 4단계 중 몇 번째인지" 계산.
 *
 * - status=VALID  → 4 (발급 완료)
 * - currentStage=APOSTILLE_DOC_ISSUED → 3 (아포스티유)
 * - currentStage=TRANSLATOR_*  → 2 (번역·공증)
 * - currentStage=USER_DOC_REQUESTED / AUTHORITY_DOC_ISSUED → 1 (발급 신청)
 */
export const toCurrentUiStep = (
  currentStage: DocumentMvpStage,
  status: DocumentMvpStatus,
): { step: number; label: string; totalSteps: number } => {
  const totalSteps = 4;
  if (status === DocumentMvpStatus.VALID) {
    return { step: 4, label: "발급 완료", totalSteps };
  }
  switch (currentStage) {
    case DocumentMvpStage.USER_DOC_REQUESTED:
    case DocumentMvpStage.AUTHORITY_DOC_ISSUED:
      return { step: 1, label: "발급 신청", totalSteps };
    case DocumentMvpStage.TRANSLATOR_DOC_RECEIVED:
    case DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED:
      return { step: 2, label: "번역·공증", totalSteps };
    case DocumentMvpStage.APOSTILLE_DOC_ISSUED:
      return { step: 3, label: "아포스티유", totalSteps };
  }
};

const earliestStartedAt = (stages: DocumentMvpStageDetail[]): Date | null => {
  const times = stages
    .map((s) => s.startedAt)
    .filter((t): t is Date => t !== null);
  if (times.length === 0) return null;
  return new Date(Math.min(...times.map((t) => t.getTime())));
};

const latestCompletedAt = (stages: DocumentMvpStageDetail[]): Date | null => {
  const times = stages
    .map((s) => s.completedAt)
    .filter((t): t is Date => t !== null);
  if (times.length === 0) return null;
  return new Date(Math.max(...times.map((t) => t.getTime())));
};
