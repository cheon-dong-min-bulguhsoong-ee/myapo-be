import { PersonaType } from "../../common/enum/persona-type.enum";

/**
 * 문서 카탈로그 1행 — 와이어프레임 "서류 발급 신청" 화면의 카드에 표시되는 항목.
 *
 * 카드 구성 ↔ 필드:
 *   아이콘(법원 / MOIS / NTS …)        — issuerIconLabel
 *   타이틀 (가족관계증명서 (영문))      — name
 *   서브카피 (미국 이민국 결혼 증빙)    — useCase
 *   우측 배지 (KR-법원, KR-NTS …)      — `{issuerCountryCode}-{issuerIconLabel}`
 *                                       — 프론트가 합쳐 표시할 수 있도록 두 필드로 분리해 내려준다.
 *   발급 신청 시 사용하는 코드           — code (DocumentType.code)
 */
export class DocumentTypeListItemResult {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly englishName: string | null,
    public readonly useCase: string | null,
    public readonly defaultTtlMonths: number,
    public readonly personaType: PersonaType,
    public readonly issuerCode: string,
    public readonly issuerName: string,
    public readonly issuerCountryCode: string,
    public readonly issuerIconLabel: string,
  ) {}
}