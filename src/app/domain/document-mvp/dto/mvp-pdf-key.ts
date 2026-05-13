import { DocumentMvpStage } from "../enum/document-mvp-stage.enum";

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
 * raw 5단계 → S3 파일명 빌더.
 *
 *   USER_DOC_REQUESTED       → `1-{문서명}_국내기관발급.pdf` (FE step 1)
 *   AUTHORITY_DOC_ISSUED     → `1-{문서명}_국내기관발급.pdf` (FE step 1)
 *   TRANSLATOR_DOC_RECEIVED  → `1-{문서명}_myapo.pdf`        (myapo 가 번역소에 보낸 원본)
 *   TRANSLATOR_DOC_NOTARIZED → `2-{문서명}_번역공증.pdf`     (FE step 2)
 *   APOSTILLE_DOC_ISSUED     → `3-{문서명}_아포스티유.pdf`   (FE step 3 / step 4 동일)
 */
const RAW_STAGE_FILENAME_BUILDER: Record<
  DocumentMvpStage,
  (docName: string) => string
> = {
  [DocumentMvpStage.USER_DOC_REQUESTED]: (n) => `1-${n}_국내기관발급.pdf`,
  [DocumentMvpStage.AUTHORITY_DOC_ISSUED]: (n) => `1-${n}_국내기관발급.pdf`,
  [DocumentMvpStage.TRANSLATOR_DOC_RECEIVED]: (n) => `1-${n}_myapo.pdf`,
  [DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED]: (n) => `2-${n}_번역공증.pdf`,
  [DocumentMvpStage.APOSTILLE_DOC_ISSUED]: (n) => `3-${n}_아포스티유.pdf`,
};

/**
 * raw 5단계 stage 의 PDF URL. document_stages.s3_object_key 에 저장 + uiSteps 노출용.
 *
 * 환경변수 : `S3_PUBLIC_BASE_URL=https://pub-<hash>.r2.dev`
 * 매핑 안 된 documentType / env 미설정 시 → null.
 */
export const toMvpRawStagePdfUrl = (
  documentTypeCode: string,
  stage: DocumentMvpStage,
): string | null => {
  const docName = MVP_PDF_DOC_NAMES[documentTypeCode];
  if (!docName) return null;
  const base = (process.env.S3_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
  if (base === "") return null;
  const fileName = RAW_STAGE_FILENAME_BUILDER[stage](docName);
  return `${base}/mvp/${fileName}`;
};
