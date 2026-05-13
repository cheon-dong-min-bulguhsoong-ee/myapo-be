export enum IssuePipelineStage {
  USER_DOC_REQUESTED = "USER_DOC_REQUESTED",
  AUTHORITY_DOC_ISSUED = "AUTHORITY_DOC_ISSUED",
  TRANSLATOR_DOC_RECEIVED = "TRANSLATOR_DOC_RECEIVED",
  TRANSLATOR_DOC_NOTARIZED = "TRANSLATOR_DOC_NOTARIZED",
  APOSTILLE_DOC_ISSUED = "APOSTILLE_DOC_ISSUED",
  INSTITUTION_DOC_SUBMIT = "INSTITUTION_DOC_SUBMIT",
}

export const issuePipelineStages = [
  IssuePipelineStage.USER_DOC_REQUESTED,
  IssuePipelineStage.AUTHORITY_DOC_ISSUED,
  IssuePipelineStage.TRANSLATOR_DOC_RECEIVED,
  IssuePipelineStage.TRANSLATOR_DOC_NOTARIZED,
  IssuePipelineStage.APOSTILLE_DOC_ISSUED,
  IssuePipelineStage.INSTITUTION_DOC_SUBMIT,
] as const;

export const issuePipelineStageLabels: Record<IssuePipelineStage, string> = {
  [IssuePipelineStage.USER_DOC_REQUESTED]: "발급 신청",
  [IssuePipelineStage.AUTHORITY_DOC_ISSUED]: "기관 발급",
  [IssuePipelineStage.TRANSLATOR_DOC_RECEIVED]: "번역·공증 접수",
  [IssuePipelineStage.TRANSLATOR_DOC_NOTARIZED]: "번역·공증 완료",
  [IssuePipelineStage.APOSTILLE_DOC_ISSUED]: "아포스티유 발급",
  [IssuePipelineStage.INSTITUTION_DOC_SUBMIT]: "기관 제출",
};
