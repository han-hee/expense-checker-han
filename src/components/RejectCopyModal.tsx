"use client";

import React, { useState } from "react";
import { AuditedExpenseItem } from "@/lib/types";
import { Copy, Check, MessageSquare, Users, ClipboardCopy, Send } from "lucide-react";

interface RejectCopyModalProps {
  data: AuditedExpenseItem[];
}

interface SubmitterViolationGroup {
  submitter: string;
  department: string;
  items: AuditedExpenseItem[];
}

export default function RejectCopyModal({ data }: RejectCopyModalProps) {
  const [copiedId, setCopiedId] = useState<string>("");

  const violatedItems = data.filter((item) => item.isViolated);

  if (violatedItems.length === 0) return null;

  // 제출자별 위반 내역 그룹화
  const submitterMap = new Map<string, SubmitterViolationGroup>();

  violatedItems.forEach((item) => {
    const submitter = item.submitter || "이름 없음";
    if (!submitterMap.has(submitter)) {
      submitterMap.set(submitter, {
        submitter,
        department: item.department || "",
        items: [],
      });
    }
    submitterMap.get(submitter)!.items.push(item);
  });

  const submitterGroups = Array.from(submitterMap.values());

  // 클립보드 복사 헬퍼 함수
  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(""), 2000);
      });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 2000);
    }
  };

  // 1인 안내 문구 생성
  const generateIndividualMessage = (group: SubmitterViolationGroup): string => {
    let msg = `[경비 정산 반려 안내 - ${group.submitter} 님]\n`;
    group.items.forEach((item) => {
      const violationReasons = item.violations
        .map((v) => `[${v.article}] ${v.reason}`)
        .join(" / ");
      const amountStr = `${item.amount.toLocaleString()}원`;
      msg += `- ${item.id}번 (${item.category} / ${item.merchant} / ${amountStr}): ${violationReasons}\n`;
    });
    return msg;
  };

  // 전체 안내 문구 일괄 생성
  const handleCopyAll = () => {
    let allMsg = `[경비 정산 전체 위반 내역 요약]\n\n`;
    submitterGroups.forEach((group) => {
      allMsg += `■ ${group.submitter} 님 (${group.department})\n`;
      group.items.forEach((item) => {
        const violationReasons = item.violations
          .map((v) => `[${v.article}] ${v.reason}`)
          .join(" / ");
        const amountStr = `${item.amount.toLocaleString()}원`;
        allMsg += `  - ${item.id}번 (${item.category} / ${item.merchant} / ${amountStr}): ${violationReasons}\n`;
      });
      allMsg += `\n`;
    });

    copyToClipboard(allMsg, "ALL");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
      {/* 헤더 및 전체 일괄 복사 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-800">
              제출자별 반려 사유 복사
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            직원에게 돌려보낼 때 카카오톡이나 사내 메일(Slack 등)에 바로 붙여넣을 수 있는 정형화된 안내 문구입니다.
          </p>
        </div>

        <button
          onClick={handleCopyAll}
          className={`inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
            copiedId === "ALL"
              ? "bg-emerald-600 text-white"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {copiedId === "ALL" ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              전체 복사 완료!
            </>
          ) : (
            <>
              <ClipboardCopy className="w-3.5 h-3.5 mr-1.5" />
              전체 위반자 일괄 복사
            </>
          )}
        </button>
      </div>

      {/* 제출자별 그룹 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {submitterGroups.map((group) => {
          const isCopied = copiedId === group.submitter;
          const individualMessage = generateIndividualMessage(group);

          return (
            <div
              key={group.submitter}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 text-sm">
                      {group.submitter}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({group.department})
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    위반 {group.items.length}건
                  </span>
                </div>

                {/* 위반 항목 요약 목록 */}
                <div className="mt-2.5 space-y-1.5">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="text-xs text-slate-600 flex items-start gap-1"
                    >
                      <span className="text-slate-400 font-mono shrink-0">•</span>
                      <span className="font-semibold text-slate-700 shrink-0">
                        {item.id}번 {item.category}:
                      </span>
                      <span className="text-red-700 font-medium truncate">
                        {item.violations.map((v) => v.reason).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 하단 개별 복사 버튼 */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  메신저용 텍스트 생성됨
                </span>
                <button
                  onClick={() => copyToClipboard(individualMessage, group.submitter)}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all shadow-2xs ${
                    isCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-white" />
                      복사 완료!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      안내 문구 복사
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
