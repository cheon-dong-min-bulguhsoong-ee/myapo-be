export enum IssuePipelineStage {
  MYDATA_RECEIVED = "MYDATA_RECEIVED",
  DOCUMENT_MOVED = "DOCUMENT_MOVED",
  TRANSLATION_RECEIVED = "TRANSLATION_RECEIVED",
  APOSTILLE_RECEIVED = "APOSTILLE_RECEIVED",
}

export const issuePipelineStages = [
  IssuePipelineStage.MYDATA_RECEIVED,
  IssuePipelineStage.DOCUMENT_MOVED,
  IssuePipelineStage.TRANSLATION_RECEIVED,
  IssuePipelineStage.APOSTILLE_RECEIVED,
] as const;

export const issuePipelineStageLabels: Record<IssuePipelineStage, string> = {
  [IssuePipelineStage.MYDATA_RECEIVED]: "MyData 수신",
  [IssuePipelineStage.DOCUMENT_MOVED]: "문서 이동",
  [IssuePipelineStage.TRANSLATION_RECEIVED]: "번역 수신",
  [IssuePipelineStage.APOSTILLE_RECEIVED]: "아포스티유 수신",
};
