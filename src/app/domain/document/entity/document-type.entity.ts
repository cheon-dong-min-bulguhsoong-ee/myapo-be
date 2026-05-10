import { PersonaType } from "../../common/enum/persona-type.enum";
import { DocumentTypeStatus } from "../enum/document-type-status.enum";

export class DocumentType {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly englishName: string | null,
    public readonly issuerCode: string,
    public readonly personaType: PersonaType,
    public readonly useCase: string | null,
    public readonly defaultTtlMonths: number,
    public readonly status: DocumentTypeStatus,
  ) {}
}
