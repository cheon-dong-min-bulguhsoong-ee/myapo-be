/**
 * 문서 발급 신청 도메인 입력.
 *
 * - HTTP 헤더(X-User-Id) · Body(documentTypeCode) 가 인터페이스 레이어에서
 *   검증·매핑된 뒤, 도메인 레이어에는 이 Command 형태로만 전달된다.
 * - 도메인 서비스는 이 클래스 외 다른 입력 형태를 알 필요가 없다.
 */
export class CreateDocumentCommand {
  constructor(
    public readonly userId: bigint,
    public readonly documentTypeCode: string,
  ) {}
}
