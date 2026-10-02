/**
 * 한결인테리어 경비 규정 (제5조~제9조) 기준 상수
 */
export const POLICY_RULES = {
  // 제5조 (식대): 1인당 12,000원 한도
  MEAL_LIMIT_PER_PERSON: 12000,

  // 제6조 (교통비): 심야 22:00 이후 퇴근 또는 업무상 외부 이동
  TAXI_NIGHT_START_TIME: "22:00",

  // 제7조 (증빙): 간이영수증은 30,000원 미만 지출에만 인정
  SIMPLE_RECEIPT_MAX_AMOUNT: 30000,

  // 제8조 (접대비): 300,000원 초과 시 사전 품의 필수
  ENTERTAINMENT_APPROVAL_THRESHOLD: 300000,

  // 제9조 (제출): 사용일로부터 30일 이내 제출
  SUBMISSION_MAX_DAYS: 30,
} as const;

export const ARTICLE_NAMES = {
  ARTICLE_5: "제5조 (식대)",
  ARTICLE_6: "제6조 (교통비)",
  ARTICLE_7: "제7조 (증빙)",
  ARTICLE_8: "제8조 (접대비)",
  ARTICLE_9: "제9조 (제출)",
} as const;
