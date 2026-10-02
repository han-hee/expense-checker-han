"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { parseCSVFile, parseCSVString } from "@/lib/parser";
import { ExpenseItem } from "@/lib/types";
import { SAMPLE_CSV_CONTENT } from "@/constants/sampleData";

interface FileUploaderProps {
  onDataLoaded: (data: ExpenseItem[], filename: string) => void;
  onReset: () => void;
  currentFilename?: string;
  totalCount?: number;
}

export default function FileUploader({
  onDataLoaded,
  onReset,
  currentFilename,
  totalCount,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("CSV 파일(.csv)만 업로드할 수 있습니다.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await parseCSVFile(file);
      if (result.errors.length > 0 && result.data.length === 0) {
        setErrorMessage(result.errors.join(", "));
      } else {
        onDataLoaded(result.data, file.name);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "파일을 파싱하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // 동일 파일 재선택 가능하도록 리셋
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleLoadSample = () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = parseCSVString(SAMPLE_CSV_CONTENT, "9월_경비내역.csv");
      onDataLoaded(result.data, "9월_경비내역.csv (샘플)");
    } catch (err: any) {
      setErrorMessage("샘플 데이터를 로드하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      {currentFilename ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-sm">{currentFilename}</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> 로드 완료
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                총 <strong className="text-slate-700 font-semibold">{totalCount ?? 0}건</strong>의 경비 내역이 파싱되었습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
            >
              다른 파일 선택
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100/80 rounded-md transition-colors"
              title="데이터 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              초기화
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      ) : (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50/60"
                : "border-slate-300 bg-slate-50 hover:bg-slate-100/50"
            }`}
          >
            <UploadCloud className={`w-12 h-12 mb-3 transition-colors ${isDragging ? "text-blue-600" : "text-slate-400"}`} />
            
            <p className="text-sm font-semibold text-slate-700 mb-1">
              경비 내역 CSV 파일을 드래그하여 놓거나 선택해 주세요
            </p>
            <p className="text-xs text-slate-500 mb-5 text-center">
              UTF-8 및 일반 CSV 인코딩 지원 (한결인테리어 경비 양식 컬럼 매핑 자동 처리)
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-xs text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors">
                <FileText className="w-4 h-4 mr-2 text-slate-500" />
                파일 찾아보기
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <button
                type="button"
                onClick={handleLoadSample}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-indigo-200 text-sm font-medium rounded-md shadow-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" />
                9월 내역 샘플 바로 테스트
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
