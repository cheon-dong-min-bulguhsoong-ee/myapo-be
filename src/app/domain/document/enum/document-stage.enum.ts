export enum DocumentStage {
    AUTHORITY_ISSUED = 'AUTHORITY_ISSUED',
    DOCUMENT_ARRIVED = 'DOCUMENT_ARRIVED',
    TRANSLATED_NOTARIZED = 'TRANSLATED_NOTARIZED',
    APOSTILLE_ISSUED = 'APOSTILLE_ISSUED',
    WALLET_STORED = 'WALLET_STORED',
}

/**
 * 5-stage 파이프라인의 진행 순서.
 * 인덱스 = 진행도. 마지막 인덱스(WALLET_STORED) 는 종착지 — 다음 stage 없음.
 */
export const DOCUMENT_STAGE_ORDER: readonly DocumentStage[] = [
    DocumentStage.AUTHORITY_ISSUED,
    DocumentStage.DOCUMENT_ARRIVED,
    DocumentStage.TRANSLATED_NOTARIZED,
    DocumentStage.APOSTILLE_ISSUED,
    DocumentStage.WALLET_STORED,
] as const;

/**
 * 현재 stage 다음에 진입할 stage 를 반환.
 * 종착지(WALLET_STORED) 에서 호출 시 null — 호출 측에서 도메인 에러로 변환할 책임.
 */
export const nextDocumentStage = (
    current: DocumentStage,
): DocumentStage | null => {
    const idx = DOCUMENT_STAGE_ORDER.indexOf(current);
    if (idx === -1 || idx === DOCUMENT_STAGE_ORDER.length - 1) {
        return null;
    }
    return DOCUMENT_STAGE_ORDER[idx + 1];
};
