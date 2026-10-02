import { ExpenseItem, AuditedExpenseItem, ViolationDetail } from "./types";
import { POLICY_RULES, ARTICLE_NAMES } from "@/constants/policyRules";

/**
 * 제5조 (식대) 검증
 * - 업무상 식대는 1인당 1회 12,000원을 한도로 한다.
 * - 여러 명이 함께 식사한 경우 금액을 인원수로 나눈 1인당 금액으로 판단한다.
 */
export function checkMealExpense(item: ExpenseItem): ViolationDetail | null {
  if (item.category !== "식대") return null;

  const participants = Math.max(1, item.participants || 1);
  const perPerson = Math.round(item.amount / participants);

  if (perPerson > POLICY_RULES.MEAL_LIMIT_PER_PERSON) {
    return {
      article: ARTICLE_NAMES.ARTICLE_5,
      reason: `1인당 12,000원 한도 초과 (1인당 ${perPerson.toLocaleString()}원)`,
    };
  }
  return null;
}

/**
 * 제6조 (교통비) 검증
 * - 택시비는 다음 경우에만 인정:
 *   1. 오후 10시(22:00) 이후 퇴근
 *   2. 업무상 외부 이동(방문, 점검 등 메모 기재)
 * - 오후 10시 이전 퇴근 택시비 불인정
 */
export function checkTaxiExpense(item: ExpenseItem): ViolationDetail | null {
  const isTaxi = item.category === "택시" || item.category.includes("택시");
  if (!isTaxi) return null;

  const time = item.time || "";
  const memo = item.memo || "";
  const isNight = time >= POLICY_RULES.TAXI_NIGHT_START_TIME; // 22:00 이후
  const isGoHome = memo.includes("퇴근");
  const isBusinessMove = /방문|점검|이동|출장|고객사|현장/.test(memo) && !isGoHome;

  if (isGoHome && !isNight) {
    return {
      article: ARTICLE_NAMES.ARTICLE_6,
      reason: `오후 10시(22:00) 이전 퇴근 택시비 불인정 (${time || "시간 미기재"} 사용)`,
    };
  }

  if (!isGoHome && !isNight && !isBusinessMove) {
    return {
      article: ARTICLE_NAMES.ARTICLE_6,
      reason: "업무상 이동 목적 또는 심야(22시 이후) 퇴근 미확인",
    };
  }

  return null;
}

/**
 * 제7조 (증빙) 검증
 * - 30,000원 이상 지출은 적격증빙(법인카드, 세금계산서 등) 필요
 * - 간이영수증은 30,000원 미만 지출에만 인정
 */
export function checkProofExpense(item: ExpenseItem): ViolationDetail | null {
  if (item.proof === "간이영수증" && item.amount >= POLICY_RULES.SIMPLE_RECEIPT_MAX_AMOUNT) {
    return {
      article: ARTICLE_NAMES.ARTICLE_7,
      reason: `간이영수증 한도(30,000원 미만) 초과 (${item.amount.toLocaleString()}원 지출)`,
    };
  }
  return null;
}

/**
 * 제8조 (접대비) 검증
 * - 거래처 접대비가 1건 300,000원을 넘는 경우 사전 품의번호 필수
 */
export function checkEntertainmentExpense(item: ExpenseItem): ViolationDetail | null {
  if (item.category === "접대비" && item.amount > POLICY_RULES.ENTERTAINMENT_APPROVAL_THRESHOLD) {
    if (!item.approvalNo || item.approvalNo.trim() === "") {
      return {
        article: ARTICLE_NAMES.ARTICLE_8,
        reason: "30만원 초과 접대비 사전 품의번호 누락",
      };
    }
  }
  return null;
}

/**
 * 제9조 (제출 - 제출 기한) 검증
 * - 경비는 사용일로부터 30일 이내에 제출 (30일 초과 시 미처리)
 */
export function checkSubmissionDeadline(item: ExpenseItem): ViolationDetail | null {
  if (!item.date || !item.submissionDate) return null;

  const usageDate = new Date(item.date);
  const subDate = new Date(item.submissionDate);

  if (isNaN(usageDate.getTime()) || isNaN(subDate.getTime())) return null;

  const diffMs = subDate.getTime() - usageDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > POLICY_RULES.SUBMISSION_MAX_DAYS) {
    return {
      article: ARTICLE_NAMES.ARTICLE_9,
      reason: `사용일로부터 30일 초과 제출 (사용 후 ${diffDays}일 경과)`,
    };
  }
  return null;
}

/**
 * 전체 경비 내역에 대해 제5조~제9조 규정 위반 여부 종합 검사
 */
export function auditExpenseItems(items: ExpenseItem[]): AuditedExpenseItem[] {
  // 1. 제9조 2항: 동일 지출 중복 제출 감지 맵 구성 (사용일_가맹점_금액)
  const duplicateGroups = new Map<string, { firstId: number; firstIndex: number }>();
  const duplicateViolations = new Map<number, ViolationDetail>();

  items.forEach((item, index) => {
    const key = `${item.date}_${item.merchant}_${item.amount}`;
    if (!duplicateGroups.has(key)) {
      duplicateGroups.set(key, { firstId: item.id, firstIndex: index });
    } else {
      const first = duplicateGroups.get(key)!;
      duplicateViolations.set(index, {
        article: ARTICLE_NAMES.ARTICLE_9,
        reason: `동일 지출 중복 제출 (${first.firstId}번과 사용일·가맹점·금액 일치)`,
      });
    }
  });

  // 2. 각 항목별 룰 체크
  return items.map((item, index) => {
    const violations: ViolationDetail[] = [];

    // 제5조 식대 한도
    const mealViolation = checkMealExpense(item);
    if (mealViolation) violations.push(mealViolation);

    // 제6조 교통비/택시 규정
    const taxiViolation = checkTaxiExpense(item);
    if (taxiViolation) violations.push(taxiViolation);

    // 제7조 증빙 규정
    const proofViolation = checkProofExpense(item);
    if (proofViolation) violations.push(proofViolation);

    // 제8조 접대비 사전 품의
    const entViolation = checkEntertainmentExpense(item);
    if (entViolation) violations.push(entViolation);

    // 제9조 제출 기한 (30일 이내)
    const deadlineViolation = checkSubmissionDeadline(item);
    if (deadlineViolation) violations.push(deadlineViolation);

    // 제9조 중복 제출
    const dupViolation = duplicateViolations.get(index);
    if (dupViolation) violations.push(dupViolation);

    return {
      ...item,
      violations,
      isViolated: violations.length > 0,
    };
  });
}
