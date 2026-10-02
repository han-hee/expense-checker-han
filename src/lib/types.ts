export interface ExpenseItem {
  id: number; // 번호
  submitter: string; // 제출자
  department: string; // 부서
  date: string; // 사용일 (YYYY-MM-DD)
  time: string; // 사용시각 (HH:mm)
  category: string; // 항목 (식대, 택시, 소모품, 접대비, 회의비, 교통비, 자재 등)
  merchant: string; // 가맹점
  amount: number; // 금액
  participants: number; // 인원
  proof: string; // 증빙 (법인카드, 간이영수증, 세금계산서, 현금영수증 등)
  approvalNo?: string; // 품의번호
  submissionDate: string; // 제출일 (YYYY-MM-DD)
  memo?: string; // 메모
}

export interface ViolationDetail {
  article: string; // e.g. "제5조 (식대)", "제6조 (교통비)"
  reason: string;  // 구체적 사유
}

export interface AuditedExpenseItem extends ExpenseItem {
  violations: ViolationDetail[];
  isViolated: boolean;
}

export interface CSVParseResult {
  data: ExpenseItem[];
  errors: string[];
  filename: string;
}
