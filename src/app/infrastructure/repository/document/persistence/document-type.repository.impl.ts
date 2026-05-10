import { Injectable } from "@nestjs/common";
import { DocumentType as DocumentTypeRow } from "@prisma/client";
import { PersonaType } from "../../../../domain/common/enum/persona-type.enum";
import { DocumentType } from "../../../../domain/document/entity/document-type.entity";
import { DocumentTypeStatus } from "../../../../domain/document/enum/document-type-status.enum";
import { DocumentTypeRepository } from "../../../../domain/document/repository/document-type.repository";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class DocumentTypeRepositoryImpl extends DocumentTypeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * 활성(ACTIVE) 상태의 카탈로그만 반환한다.
   * DEPRECATED · 논리 삭제 된 카탈로그는 신규 신청 대상이 아니므로 null 로 처리해
   * 호출 측에서 "사용 가능한 카탈로그" 만 다루도록 일원화.
   */
  async findByCode(code: string): Promise<DocumentType | null> {
    const row = await this.prisma.documentType.findFirst({
      where: { code, status: DocumentTypeStatus.ACTIVE, isDelete: false },
    });
    return row === null ? null : this.toEntity(row);
  }

  private toEntity(row: DocumentTypeRow): DocumentType {
    return new DocumentType(
      row.code,
      row.name,
      row.englishName,
      row.issuerCode,
      row.personaType as PersonaType,
      row.useCase,
      row.defaultTtlMonths,
      row.status as DocumentTypeStatus,
    );
  }
}
