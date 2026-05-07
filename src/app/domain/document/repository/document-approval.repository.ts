import {DocumentApproval} from '../entity/document-approval.entity';
import {DocumentStage} from '../enum/document-stage.enum';

export interface CreateDocumentApprovalInput {
    documentId: bigint;
    stage: DocumentStage;
    xrplTxHash: string;
    approvedAt: Date;
}

export abstract class DocumentApprovalRepository {
    abstract create(input: CreateDocumentApprovalInput): Promise<DocumentApproval>;
}
