import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PersonaType } from "../../../domain/common/enum/persona-type.enum";
import { DocumentTypeListItemResult } from "../../../domain/document/dto/document-type-list-item.result";

/**
 * 문서 카탈로그 1개 — 와이어프레임 "서류 발급 신청" 카드 1장과 1:1.
 *
 * 우측 배지(예: `KR-법원`) 는 프론트가 `issuerCountryCode` + `issuerIconLabel` 을 합쳐 만든다.
 */
export class DocumentTypeListItemRes {
  @ApiProperty({
    description: "문서 카탈로그 코드 — 발급 신청(`POST /documents`) 시 사용.",
    example: "KR-NTS-TAX-PAYMENT",
  })
  readonly code!: string;

  @ApiProperty({
    description: "카탈로그 표시명 (한국어). 카드 타이틀.",
    example: "납세증명서 (영문)",
  })
  readonly name!: string;

  @ApiPropertyOptional({
    description: "영문 표시명 (있을 경우).",
    example: "Certificate of Tax Payment",
    nullable: true,
  })
  readonly englishName!: string | null;

  @ApiPropertyOptional({
    description: "사용 사례 — 카드 서브카피.",
    example: "미국 영사관 비자 재정증명",
    nullable: true,
  })
  readonly useCase!: string | null;

  @ApiProperty({
    description: "기본 TTL (개월) — 발급 후 유효 기간.",
    example: 6,
  })
  readonly defaultTtlMonths!: number;

  @ApiProperty({
    enum: PersonaType,
    description: "대상 페르소나.",
    example: PersonaType.KOREAN,
  })
  readonly personaType!: PersonaType;

  @ApiProperty({
    description: "발급기관 코드 (Issuer.code).",
    example: "KR-NTS",
  })
  readonly issuerCode!: string;

  @ApiProperty({
    description: "발급기관 이름 (Issuer.name).",
    example: "국세청",
  })
  readonly issuerName!: string;

  @ApiProperty({
    description: "발급기관 국가 코드 (ISO 3166-1 alpha-2).",
    example: "KR",
  })
  readonly issuerCountryCode!: string;

  @ApiProperty({
    description:
      "발급기관 짧은 라벨 — 카드 좌측 아이콘 텍스트 (예: 법원 / MOIS / NTS / 병무 / 경찰 / 학교 / 건보).",
    example: "NTS",
  })
  readonly issuerIconLabel!: string;

  static from(r: DocumentTypeListItemResult): DocumentTypeListItemRes {
    return {
      code: r.code,
      name: r.name,
      englishName: r.englishName,
      useCase: r.useCase,
      defaultTtlMonths: r.defaultTtlMonths,
      personaType: r.personaType,
      issuerCode: r.issuerCode,
      issuerName: r.issuerName,
      issuerCountryCode: r.issuerCountryCode,
      issuerIconLabel: r.issuerIconLabel,
    };
  }
}