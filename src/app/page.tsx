"use client";

import React, { useState } from "react";
import { ExpenseItem, AuditedExpenseItem } from "@/lib/types";
import { auditExpenseItems } from "@/lib/rules";
import FileUploader from "@/components/FileUploader";
import SummaryCards from "@/components/SummaryCards";
import RejectCopyModal from "@/components/RejectCopyModal";
import ExpenseTable from "@/components/ExpenseTable";
import { ShieldAlert, Receipt } from "lucide-react";

export default function Home() {
  const [auditedData, setAuditedData] = useState<AuditedExpenseItem[]>([]);
  const [currentFilename, setCurrentFilename] = useState<string>("");

  const handleDataLoaded = (data: ExpenseItem[], filename: string) => {
    // 3.2 룰 엔진을 통한 규정 위반 검사 실행
    const audited = auditExpenseItems(data);
    setAuditedData(audited);
    setCurrentFilename(filename);
  };

  const handleReset = () => {
    setAuditedData([]);
    setCurrentFilename("");
  };

  const violationCount = auditedData.filter((i) => i.isViolated).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 상단 헤더 네비게이션 */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  경비 정산 검사기
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                경비 내역 CSV 파일을 올리면 회사 경비 규정(제5조~제9조) 위반 여부를 자동으로 검사합니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                한결인테리어 경비 규정 (제5~9조) 자동 검증
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
        {/* CSV 파일 업로드 영역 */}
        <section aria-label="CSV 파일 업로드">
          <FileUploader
            onDataLoaded={handleDataLoaded}
            onReset={handleReset}
            currentFilename={currentFilename}
            totalCount={auditedData.length}
          />
        </section>

        {/* 3.3 대시보드 요약 지표 카드 및 조항별 위반 현황 */}
        {auditedData.length > 0 && (
          <section aria-label="대시보드 요약 및 조항별 통계">
            <SummaryCards data={auditedData} />
          </section>
        )}

        {/* 3.4 제출자별 반려 사유 클립보드 복사 섹션 */}
        {auditedData.length > 0 && violationCount > 0 && (
          <section aria-label="제출자별 반려 사유 복사">
            <RejectCopyModal data={auditedData} />
          </section>
        )}

        {/* 3.1 & 3.2 & 3.4 반응형 데이터 그리드 테이블 및 위반 건 필터링 */}
        <section aria-label="경비 내역 및 규정 검사 테이블">
          <ExpenseTable data={auditedData} />
        </section>
      </main>

      {/* 하단 푸터 */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          경비 정산 검사기 (Expense Policy Auditor) · 제정 2024-01-01 / 개정 2026-03-01 기준
        </div>
      </footer>
    </div>
  );
}
