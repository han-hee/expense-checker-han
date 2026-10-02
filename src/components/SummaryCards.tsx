"use client";

import React from "react";
import { AuditedExpenseItem } from "@/lib/types";
import { ARTICLE_NAMES } from "@/constants/policyRules";
import { FileSpreadsheet, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

interface SummaryCardsProps {
  data: AuditedExpenseItem[];
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  if (data.length === 0) return null;

  const totalCount = data.length;
  const violatedItems = data.filter((item) => item.isViolated);
  const violationCount = violatedItems.length;
  const normalCount = totalCount - violationCount;

  // 조항별 위반 건수 집계 (항목당 동일 조항 중복 방지를 위해 Set 활용)
  const articleStats: Record<string, number> = {
    [ARTICLE_NAMES.ARTICLE_5]: 0,
    [ARTICLE_NAMES.ARTICLE_6]: 0,
    [ARTICLE_NAMES.ARTICLE_7]: 0,
    [ARTICLE_NAMES.ARTICLE_8]: 0,
    [ARTICLE_NAMES.ARTICLE_9]: 0,
  };

  violatedItems.forEach((item) => {
    const articleSet = new Set<string>();
    item.violations.forEach((v) => {
      if (v.article.includes("제5조")) articleSet.add(ARTICLE_NAMES.ARTICLE_5);
      if (v.article.includes("제6조")) articleSet.add(ARTICLE_NAMES.ARTICLE_6);
      if (v.article.includes("제7조")) articleSet.add(ARTICLE_NAMES.ARTICLE_7);
      if (v.article.includes("제8조")) articleSet.add(ARTICLE_NAMES.ARTICLE_8);
      if (v.article.includes("제9조")) articleSet.add(ARTICLE_NAMES.ARTICLE_9);
    });

    articleSet.forEach((article) => {
      if (articleStats[article] !== undefined) {
        articleStats[article]++;
      }
    });
  });

  return (
    <div className="space-y-4">
      {/* 3.3 핵심 지표 카드 (전체 건수, 위반 건수, 정상 건수) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 전체 검사 건수 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              전체 검사 건수
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{totalCount}</span>
              <span className="text-sm text-slate-500">건</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* 규정 위반 건수 */}
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-xs bg-red-50/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              규정 위반 건수
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-600">{violationCount}</span>
              <span className="text-sm text-red-500">건</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* 정상 처리 건수 */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              정상 처리 건수
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-700">{normalCount}</span>
              <span className="text-sm text-emerald-600">건</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3.3 조항별 위반 통계 배지 칩 카드 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-700">
              조항별 규정 위반 현황
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            사내 규정 제5조 ~ 제9조
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(articleStats).map(([article, count]) => {
            const hasViolation = count > 0;
            return (
              <div
                key={article}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  hasViolation
                    ? "bg-red-50/60 border-red-200 text-red-900"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <p className="text-xs font-medium truncate" title={article}>
                  {article}
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    hasViolation ? "text-red-600" : "text-slate-400"
                  }`}
                >
                  {count}건
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
