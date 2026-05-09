import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * PDF 패스워드 보호 업로드 요청.
 *
 * `multipart/form-data` 의 file 필드(`file`) 옆에 `userPassword` 텍스트 필드가 함께 전송된다.
 * owner password 는 내부적으로 user password 와 동일하게 설정 — 외부 노출 없음.
 */
export class UploadEncryptedPdfReq {
    @ApiProperty({
        description: 'PDF 열람 비밀번호. 다운받은 사람이 PDF 뷰어에서 이 값으로 연다.',
        example: 'A1b2!c3d4',
        minLength: 4,
        maxLength: 64,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(64)
    readonly userPassword!: string;
}
