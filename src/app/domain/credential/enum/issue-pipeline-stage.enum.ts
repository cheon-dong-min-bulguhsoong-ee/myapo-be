export enum IssuePipelineStage {
  AUTHORITY_ISSUED = "AUTHORITY_ISSUED",
  DOCUMENT_ARRIVED = "DOCUMENT_ARRIVED",
  TRANSLATED_NOTARIZED = "TRANSLATED_NOTARIZED",
  APOSTILLE_ISSUED = "APOSTILLE_ISSUED",
}

export const issuePipelineStages = [
  IssuePipelineStage.AUTHORITY_ISSUED,
  IssuePipelineStage.DOCUMENT_ARRIVED,
  IssuePipelineStage.TRANSLATED_NOTARIZED,
  IssuePipelineStage.APOSTILLE_ISSUED,
] as const;

export const issuePipelineStageLabels: Record<IssuePipelineStage, string> = {
  [IssuePipelineStage.AUTHORITY_ISSUED]: "기관 발급",
  [IssuePipelineStage.DOCUMENT_ARRIVED]: "문서 도착",
  [IssuePipelineStage.TRANSLATED_NOTARIZED]: "번역·공증 완료",
  [IssuePipelineStage.APOSTILLE_ISSUED]: "아포스티유 발급",
};
