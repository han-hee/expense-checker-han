import Papa from "papaparse";
import { ExpenseItem, CSVParseResult } from "./types";

/**
 * 금액 문자열을 숫자로 정제 (예: "12,000" -> 12000, " 15000 " -> 15000)
 */
function parseAmount(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * 인원 수 정제 (기본값 1)
 */
function parseParticipants(val: any): number {
  if (typeof val === "number") return val > 0 ? val : 1;
  if (!val) return 1;
  const num = parseInt(String(val).replace(/[^0-9]/g, ""), 10);
  return isNaN(num) || num <= 0 ? 1 : num;
}

/**
 * 원시 CSV 행 레코드를 ExpenseItem 타입으로 변환 및 정규화
 */
export function normalizeExpenseRow(row: Record<string, any>, index: number): ExpenseItem | null {
  // 빈 행인 경우 무시
  const values = Object.values(row).filter((v) => v !== undefined && String(v).trim() !== "");
  if (values.length === 0) return null;

  const id = parseInt(row["번호"] || row["id"] || row["No"] || `${index + 1}`, 10) || index + 1;
  const submitter = String(row["제출자"] || row["이름"] || row["작성자"] || "").trim();
  const department = String(row["부서"] || row["소속"] || "").trim();
  const date = String(row["사용일"] || row["일자"] || row["날짜"] || "").trim();
  const time = String(row["사용시각"] || row["시간"] || row["시각"] || "").trim();
  const category = String(row["항목"] || row["구분"] || row["비목"] || "").trim();
  const merchant = String(row["가맹점"] || row["사용처"] || row["거래처"] || "").trim();
  const amount = parseAmount(row["금액"] || row["비용"] || row["합계"]);
  const participants = parseParticipants(row["인원"] || row["참석자수"]);
  const proof = String(row["증빙"] || row["영수증"] || row["증빙구분"] || "").trim();
  const approvalNo = row["품의번호"] ? String(row["품의번호"]).trim() : "";
  const submissionDate = String(row["제출일"] || row["정산일"] || "").trim();
  const memo = row["메모"] ? String(row["메모"]).trim() : "";

  return {
    id,
    submitter,
    department,
    date,
    time,
    category,
    merchant,
    amount,
    participants,
    proof,
    approvalNo: approvalNo || undefined,
    submissionDate,
    memo: memo || undefined,
  };
}

/**
 * CSV 파일 파싱 (File 객체)
 */
export function parseCSVFile(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const errors: string[] = results.errors.map((e) => `[행 ${e.row}] ${e.message}`);
        const data: ExpenseItem[] = [];

        results.data.forEach((row, idx) => {
          const item = normalizeExpenseRow(row, idx);
          if (item) {
            data.push(item);
          }
        });

        resolve({
          data,
          errors,
          filename: file.name,
        });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [`CSV 파일 읽기 실패: ${error.message}`],
          filename: file.name,
        });
      },
    });
  });
}

/**
 * CSV 문자열 직접 파싱 (샘플 데이터 로딩용)
 */
export function parseCSVString(csvContent: string, filename = "샘플_경비내역.csv"): CSVParseResult {
  const results = Papa.parse<Record<string, any>>(csvContent, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });

  const errors: string[] = results.errors.map((e) => `[행 ${e.row}] ${e.message}`);
  const data: ExpenseItem[] = [];

  results.data.forEach((row, idx) => {
    const item = normalizeExpenseRow(row, idx);
    if (item) {
      data.push(item);
    }
  });

  return {
    data,
    errors,
    filename,
  };
}
