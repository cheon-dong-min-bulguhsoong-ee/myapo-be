import {Document} from '../entity/document.entity';
import {DocumentStage} from '../enum/document-stage.enum';
import {DocumentStatus} from '../enum/document-status.enum';

export interface CreateDocumentInput {
    documentCode: string;
    userId: bigint;
    documentTypeCode: string;
    status: DocumentStatus;
    currentStage: DocumentStage;
    requestedAt: Date;
}

export abstract class DocumentRepository {
    abstract create(input: CreateDocumentInput): Promise<Document>;

    abstract findByCode(documentCode: string): Promise<Document | null>;
}
