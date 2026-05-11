/**
 * 문서 발급 5단계 파이프라인 — `{행위자}_{대상}_{상태}` 패턴.
 *
 * BE 데이터 모델은 5단계로 정확히 기록하지만 FE 는 4단계로 묶어서 표시한다 (history/app-1 화면).
 *   FE "발급 신청"     ← USER_DOC_REQUESTED + AUTHORITY_DOC_ISSUED
 *   FE "번역·공증"     ← TRANSLATOR_DOC_RECEIVED + TRANSLATOR_DOC_NOTARIZED
 *   FE "아포스티유"    ← APOSTILLE_DOC_ISSUED (진행 중)
 *   FE "발급 완료"     ← APOSTILLE_DOC_ISSUED 의 DONE 시점 (= status VALID)
 *
 * Mock 흐름:
 *   `POST /document-mvp` 1회 호출로 stage 1·2 는 자동 DONE 처리되고,
 *   사용자는 stage 3 (TRANSLATOR_DOC_RECEIVED) PENDING 부터 advance 흐름을 탄다.
 */
export enum DocumentMvpStage {
  USER_DOC_REQUESTED = "USER_DOC_REQUESTED",
  AUTHORITY_DOC_ISSUED = "AUTHORITY_DOC_ISSUED",
  TRANSLATOR_DOC_RECEIVED = "TRANSLATOR_DOC_RECEIVED",
  TRANSLATOR_DOC_NOTARIZED = "TRANSLATOR_DOC_NOTARIZED",
  APOSTILLE_DOC_ISSUED = "APOSTILLE_DOC_ISSUED",
}

/**
 * 응답에 같이 내려보낼 한글 라벨 — FE 가 그대로 표시 가능.
 */
export const DOCUMENT_MVP_STAGE_LABELS: Record<DocumentMvpStage, string> = {
  [DocumentMvpStage.USER_DOC_REQUESTED]: "발급 신청",
  [DocumentMvpStage.AUTHORITY_DOC_ISSUED]: "기관 발급",
  [DocumentMvpStage.TRANSLATOR_DOC_RECEIVED]: "번역·공증 접수",
  [DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED]: "번역·공증 완료",
  [DocumentMvpStage.APOSTILLE_DOC_ISSUED]: "아포스티유 발급",
};

/**
 * 5단계 정렬 순서 — 응답에 항상 5건의 stage 항목을 정렬된 형태로 채워주기 위함.
 */
export const ORDERED_MVP_STAGES: DocumentMvpStage[] = [
  DocumentMvpStage.USER_DOC_REQUESTED,
  DocumentMvpStage.AUTHORITY_DOC_ISSUED,
  DocumentMvpStage.TRANSLATOR_DOC_RECEIVED,
  DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED,
  DocumentMvpStage.APOSTILLE_DOC_ISSUED,
];

/**
 * 현재 stage 다음에 진입할 stage 를 반환. 종착지(APOSTILLE_DOC_ISSUED) 면 null.
 */
export const nextMvpStage = (
  current: DocumentMvpStage,
): DocumentMvpStage | null => {
  switch (current) {
    case DocumentMvpStage.USER_DOC_REQUESTED:
      return DocumentMvpStage.AUTHORITY_DOC_ISSUED;
    case DocumentMvpStage.AUTHORITY_DOC_ISSUED:
      return DocumentMvpStage.TRANSLATOR_DOC_RECEIVED;
    case DocumentMvpStage.TRANSLATOR_DOC_RECEIVED:
      return DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED;
    case DocumentMvpStage.TRANSLATOR_DOC_NOTARIZED:
      return DocumentMvpStage.APOSTILLE_DOC_ISSUED;
    case DocumentMvpStage.APOSTILLE_DOC_ISSUED:
      return null;
  }
};
