import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { DocumentStatus } from "../../../domain/document/enum/document-status.enum";

/**
 * 문서 관리 리스트 조회 query.
 *
 * 와이어프레임 docs 탭 필터(`F.docs.filters` + `F.docs.q`) 와 동일 옵션:
 *   - status   : 진행/유효/만료/폐기/실패 탭 → DocumentStatus 1:1 매핑
 *   - docType  : 문서 카탈로그 코드
 *   - country  : 발급기관 국가 (Issuer.countryCode)
 *   - q        : documentCode / 회원이름 / 이메일 부분일치
 *   - page     : 1-based, 기본 1
 *   - limit    : 기본 20, 최대 100
 */
export class DocumentListReq {
  @ApiPropertyOptional({
    enum: DocumentStatus,
    description:
      "문서 상태 필터 — 와이어프레임 탭(progress/valid/expired/revoked/failed) 과 매핑.",
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  readonly status?: DocumentStatus;

  @ApiPropertyOptional({
    description: "문서 카탈로그 코드 필터.",
    example: "KR-NTS-TAX-PAYMENT",
    maxLength: 40,
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  readonly documentTypeCode?: string;

  @ApiPropertyOptional({
    description: "국가 코드 필터 (ISO 3166-1 alpha-2). 발급기관 국가 기준.",
    example: "KR",
    minLength: 2,
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  readonly countryCode?: string;

  @ApiPropertyOptional({
    description: "검색어. documentCode · 요청자 이름 · 이메일 부분일치.",
    example: "kim",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly q?: string;

  @ApiPropertyOptional({
    description: "페이지 번호 (1-based).",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: "페이지 크기.",
    example: 20,
    default: 20,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 20;
}
