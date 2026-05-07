export enum DocumentStage {
    AUTHORITY_ISSUED = 'AUTHORITY_ISSUED',
    DOCUMENT_ARRIVED = 'DOCUMENT_ARRIVED',
    TRANSLATED_NOTARIZED = 'TRANSLATED_NOTARIZED',
    APOSTILLE_ISSUED = 'APOSTILLE_ISSUED',
    WALLET_STORED = 'WALLET_STORED',
}

/**
 * 현재 stage 다음에 진입할 stage 를 반환.
 * 종착지(WALLET_STORED) 면 null — 호출 측에서 도메인 에러로 변환할 책임.
 */
export const nextDocumentStage = (
    current: DocumentStage,
): DocumentStage | null => {
    switch (current) {
        case DocumentStage.AUTHORITY_ISSUED:
            return DocumentStage.DOCUMENT_ARRIVED;
        case DocumentStage.DOCUMENT_ARRIVED:
            return DocumentStage.TRANSLATED_NOTARIZED;
        case DocumentStage.TRANSLATED_NOTARIZED:
            return DocumentStage.APOSTILLE_ISSUED;
        case DocumentStage.APOSTILLE_ISSUED:
            return DocumentStage.WALLET_STORED;
        case DocumentStage.WALLET_STORED:
            return null;
    }
};
