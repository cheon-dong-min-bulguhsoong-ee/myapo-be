import { DocumentMvpStage } from "../enum/document-mvp-stage.enum";

/**
 * MVP step 별 단계명 — S3 파일명 suffix 에 사용 (`{step}-{문서명}_{단계명}.pdf`).
 */
const MVP_PDF_STAGE_PARTS: Record<1 | 2 | 3, string> = {
  1: "국내기관발급",
  2: "번역공증",
  3: "아포스티유",
};

/**
 * raw 5단계 → FE 4단계 step 매핑. step 4(발급 완료) 는 별도 stage 없이
 * APOSTILLE_DOC_ISSUED 완료 + status=VALID 로 표현하므로 raw stage 매핑은 1~3 만 존재.
 */
const RAW_STAGE_TO_UI_STEP: Record<DocumentMvpStage, 1 | 2 | 3> = {
  [DocumentMvpStage.USER_DOC_REQUESTED]: 1,
  [DocumentMvpStage.AUTHORITY_DOC_ISSUED]: 1,
  [DocumentMvpStage.TRANSLATOR_DOC_RECEIVED]: 2,
  [DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED]: 2,
  [DocumentMvpStage.APOSTILLE_DOC_ISSUED]: 3,
};

/**
 * documentTypeCode → S3 파일명에 들어가는 한글 문서명(띄어쓰기 없음).
 * 매핑 안 된 type 은 PDF 미제공.
 */
const MVP_PDF_DOC_NAMES: Record<string, string> = {
  "KR-MOJ-CRIMINAL-RECORD": "범죄경력증명서",
  "KR-MOJ-RESIDENT-CERT": "주민등록등본",
  "KR-MOJ-FAMILY-CERT": "가족관계증명서",
};

/**
 * detail response 의 `uiSteps[].pdfUrl` — R2 public dev URL 직접 노출.
 *
 * R2 객체 키 패턴 : `mvp/{step}-{문서명}_{단계명}.pdf`
 * 환경변수      : `S3_PUBLIC_BASE_URL=https://pub-<hash>.r2.dev`
 *
 * step 4(발급 완료), 매핑 안 된 documentType, env 미설정 시 → null.
 */
export const toMvpStepPdfUrl = (
  documentTypeCode: string,
  step: number,
): string | null => {
  if (step !== 1 && step !== 2 && step !== 3) return null;
  const docName = MVP_PDF_DOC_NAMES[documentTypeCode];
  if (!docName) return null;
  const base = (process.env.S3_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
  if (base === "") return null;
  return `${base}/mvp/${step}-${docName}_${MVP_PDF_STAGE_PARTS[step]}.pdf`;
};

/**
 * raw 5단계 stage 의 PDF URL. document_stages.s3_object_key 에 저장 + uiSteps 노출용.
 * 매핑 안 된 documentType 이거나 env 미설정 시 null.
 */
export const toMvpRawStagePdfUrl = (
  documentTypeCode: string,
  stage: DocumentMvpStage,
): string | null => {
  return toMvpStepPdfUrl(documentTypeCode, RAW_STAGE_TO_UI_STEP[stage]);
};
