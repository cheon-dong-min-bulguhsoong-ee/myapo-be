export enum IssuePipelineStage {
  RECEIVED = 'RECEIVED',
  PRE_REVIEW = 'PRE_REVIEW',
  TRANSLATION_REVIEW = 'TRANSLATION_REVIEW',
  NOTARY_SIGNATURE = 'NOTARY_SIGNATURE',
  ISSUED = 'ISSUED',
}

export const issuePipelineStages = [
  IssuePipelineStage.RECEIVED,
  IssuePipelineStage.PRE_REVIEW,
  IssuePipelineStage.TRANSLATION_REVIEW,
  IssuePipelineStage.NOTARY_SIGNATURE,
  IssuePipelineStage.ISSUED,
] as const;

export const issuePipelineStageLabels: Record<IssuePipelineStage, string> = {
  [IssuePipelineStage.RECEIVED]: '접수',
  [IssuePipelineStage.PRE_REVIEW]: '사전 검토',
  [IssuePipelineStage.TRANSLATION_REVIEW]: '번역 검토',
  [IssuePipelineStage.NOTARY_SIGNATURE]: '공증 서명',
  [IssuePipelineStage.ISSUED]: '발급 완료',
};
