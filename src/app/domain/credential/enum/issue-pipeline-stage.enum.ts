export enum IssuePipelineStage {
  AUTHORITY_DOC_ISSUED = "AUTHORITY_DOC_ISSUED",
  TRANSLATOR_DOC_RECEIVED = "TRANSLATOR_DOC_RECEIVED",
  TRANSLATOR_DOC_NOTARIZED = "TRANSLATOR_DOC_NOTARIZED",
  APOSTILLE_DOC_ISSUED = "APOSTILLE_DOC_ISSUED",
}

export const issuePipelineStages = [
  IssuePipelineStage.AUTHORITY_DOC_ISSUED,
  IssuePipelineStage.TRANSLATOR_DOC_RECEIVED,
  IssuePipelineStage.TRANSLATOR_DOC_NOTARIZED,
  IssuePipelineStage.APOSTILLE_DOC_ISSUED,
] as const;

export const issuePipelineStageLabels: Record<IssuePipelineStage, string> = {
  [IssuePipelineStage.AUTHORITY_DOC_ISSUED]: "기관 발급",
  [IssuePipelineStage.TRANSLATOR_DOC_RECEIVED]: "번역·공증 접수",
  [IssuePipelineStage.TRANSLATOR_DOC_NOTARIZED]: "번역·공증 완료",
  [IssuePipelineStage.APOSTILLE_DOC_ISSUED]: "아포스티유 발급",
};
