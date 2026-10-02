"use client";

import React, { useState } from "react";
import { AuditedExpenseItem } from "@/lib/types";
import { Search, CreditCard, Users, FileCheck, Info, AlertCircle, CheckCircle2, Filter } from "lucide-react";

interface ExpenseTableProps {
  data: AuditedExpenseItem[];
}

export default function ExpenseTable({ data }: ExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyViolations, setShowOnlyViolations] = useState(false);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <FileCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">표시할 경비 내역이 없습니다</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          위의 업로드 영역에서 CSV 파일을 선택하거나 9월 샘플 데이터를 불러와 주세요.
        </p>
      </div>
    );
  }

  const totalCount = data.length;
  const violationCount = data.filter((i) => i.isViolated).length;

  // 1. 위반 건만 보기 필터 적용
  const baseData = showOnlyViolations ? data.filter((item) => item.isViolated) : data;

  // 2. 검색 필터링 (제출자, 부서, 가맹점, 항목, 메모, 위반 사유 등)
  const filteredData = baseData.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const violationMatch = item.violations.some(
      (v) => v.article.toLowerCase().includes(term) || v.reason.toLowerCase().includes(term)
    );
    return (
      item.submitter.toLowerCase().includes(term) ||
      item.department.toLowerCase().includes(term) ||
      item.merchant.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (item.memo && item.memo.toLowerCase().includes(term)) ||
      (item.approvalNo && item.approvalNo.toLowerCase().includes(term)) ||
      violationMatch
    );
  });

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* 테이블 상단 툴바 및 필터 토글 */}
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              경비 정산 내역 및 규정 검사 결과
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {filteredData.length !== data.length ? `${filteredData.length} / ${data.length}건` : `총 ${data.length}건`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            * 빨간색 배경으로 표시된 행은 사내 경비 규정(제5조~제9조) 위반 항목입니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* 3.4 '위반 건만 보기' 토글 스위치 버튼 그룹 */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
            <button
              type="button"
              onClick={() => setShowOnlyViolations(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                !showOnlyViolations
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              전체 보기 ({totalCount}건)
            </button>
            <button
              type="button"
              onClick={() => setShowOnlyViolations(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                showOnlyViolations
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-red-700 hover:text-red-900"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              위반 건만 보기 ({violationCount}건)
            </button>
          </div>

          {/* 간이 검색 입력창 */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="제출자, 가맹점, 비목 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* 테이블 뷰 영역 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 w-12 text-center">번호</th>
              <th className="py-3 px-4 min-w-[240px]">검사 결과 (규정 위반 여부)</th>
              <th className="py-3 px-3 min-w-[80px]">제출자</th>
              <th className="py-3 px-3 min-w-[80px]">부서</th>
              <th className="py-3 px-3 min-w-[130px]">사용일시</th>
              <th className="py-3 px-3 min-w-[70px]">비목</th>
              <th className="py-3 px-3 min-w-[130px]">가맹점</th>
              <th className="py-3 px-3 text-right min-w-[90px]">금액</th>
              <th className="py-3 px-3 text-center min-w-[60px]">인원</th>
              <th className="py-3 px-3 min-w-[80px]">증빙</th>
              <th className="py-3 px-3 min-w-[100px]">품의번호</th>
              <th className="py-3 px-3 min-w-[90px]">제출일</th>
              <th className="py-3 px-3 min-w-[140px]">메모</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-10 text-center text-slate-400">
                  {showOnlyViolations
                    ? "규정 위반 항목이 없거나 검색 결과가 없습니다."
                    : "검색 조건에 맞는 내역이 없습니다."}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const isViolated = item.isViolated;
                const perPerson = item.participants > 1 ? Math.round(item.amount / item.participants) : item.amount;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isViolated
                        ? "bg-red-50/80 hover:bg-red-100/70 border-l-4 border-l-red-500"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* 번호 */}
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-600">
                      {item.id}
                    </td>

                    {/* 검사 결과 (위반 배지 및 구체 사유) */}
                    <td className="py-3 px-4">
                      {isViolated ? (
                        <div className="space-y-1.5">
                          {item.violations.map((v, idx) => (
                            <div key={idx} className="flex flex-col items-start gap-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300 shadow-2xs">
                                <AlertCircle className="w-3 h-3 mr-1 text-red-600 shrink-0" />
                                {v.article} 위반
                              </span>
                              <span className="text-[11px] font-semibold text-red-700 leading-tight">
                                {v.reason}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          정상
                        </span>
                      )}
                    </td>

                    {/* 제출자 */}
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                      {item.submitter}
                    </td>

                    {/* 부서 */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      {item.department}
                    </td>

                    {/* 사용일시 */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{item.date}</div>
                      <div className="text-[11px] text-slate-400">{item.time}</div>
                    </td>

                    {/* 비목 */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>

                    {/* 가맹점 */}
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {item.merchant}
                    </td>

                    {/* 금액 */}
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono">
                      <div className="font-bold text-slate-900">
                        {item.amount.toLocaleString()}원
                      </div>
                      {item.participants > 1 && (
                        <div className="text-[10px] text-slate-400">
                          (1인당 {perPerson.toLocaleString()}원)
                        </div>
                      )}
                    </td>

                    {/* 인원 */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center text-xs text-slate-600 font-medium">
                        <Users className="w-3 h-3 mr-0.5 text-slate-400" />
                        {item.participants}명
                      </span>
                    </td>

                    {/* 증빙 */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          item.proof === "간이영수증"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : item.proof === "법인카드"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <CreditCard className="w-2.5 h-2.5 mr-1 opacity-70" />
                        {item.proof}
                      </span>
                    </td>

                    {/* 품의번호 */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.approvalNo ? (
                        <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] font-medium border border-indigo-200/60">
                          {item.approvalNo}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* 제출일 */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {item.submissionDate}
                    </td>

                    {/* 메모 */}
                    <td className="py-3 px-3 max-w-xs truncate text-slate-600" title={item.memo}>
                      {item.memo || <span className="text-slate-300">-</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 테이블 하단 푸터 */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {showOnlyViolations
              ? "현재 규정 위반 건만 필터링되어 표시되고 있습니다."
              : "전체 경비 정산 내역이 표시되고 있습니다."}
          </span>
        </div>
        <div className="font-medium text-slate-700">
          표시: <strong className="text-slate-900">{filteredData.length}</strong> / {totalCount}건 (위반 {violationCount}건)
        </div>
      </div>
    </div>
  );
}
