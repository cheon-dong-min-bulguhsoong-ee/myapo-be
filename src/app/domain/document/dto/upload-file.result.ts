/**
 * 파일 업로드 결과 — 다운로드 URI 는 외부 노출용 백엔드 프록시 경로.
 *
 * `downloadUri` 는 `/api/v1/documents/files/<encodedKey>` 형태의 절대/상대 경로.
 * 프록시 엔드포인트가 R2 에서 받아 스트리밍 — 버킷은 private 로 유지된다.
 */
export class UploadFileResult {
    constructor(
        public readonly fileKey: string,
        public readonly originalFileName: string,
        public readonly contentType: string,
        public readonly size: number,
        public readonly downloadUri: string,
        public readonly encrypted: boolean,
        public readonly uploadedAt: Date,
    ) {
    }
}
