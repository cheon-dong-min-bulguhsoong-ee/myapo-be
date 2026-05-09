/**
 * PDF 패스워드 보호(open-password) 추상 포트.
 *
 * 입력 PDF 바이트 → AES-256 + user 패스워드가 걸린 PDF 바이트.
 * owner 패스워드는 구현체가 user 와 동일하게 설정 — 외부 개념 노출 없음.
 * 구현체가 어떤 도구(qpdf, muhammara, ...) 를 쓰는지는 도메인이 알 필요 없다.
 */
export abstract class PdfEncryptor {
    abstract protectWithPassword(input: PdfEncryptorInput): Promise<Buffer>;
}

export interface PdfEncryptorInput {
    readonly source: Buffer;
    readonly userPassword: string;
}
