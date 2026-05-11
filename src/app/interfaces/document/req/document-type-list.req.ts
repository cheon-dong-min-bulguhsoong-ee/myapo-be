import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { PersonaType } from "../../../domain/common/enum/persona-type.enum";

/**
 * 문서 카탈로그 리스트 조회 query.
 *
 * - `personaType` 미지정 시 전체 페르소나의 카탈로그 반환.
 *   지정 시(KOREAN | FOREIGNER) 해당 페르소나용 카탈로그만 반환.
 *   기본은 "미지정 = 전체" — 클라이언트가 본인 페르소나 알고 있을 때 명시적으로 좁힌다.
 */
export class DocumentTypeListReq {
  @ApiPropertyOptional({
    enum: PersonaType,
    description: "대상 페르소나 필터. 미지정 시 전체.",
  })
  @IsOptional()
  @IsEnum(PersonaType)
  readonly personaType?: PersonaType;
}