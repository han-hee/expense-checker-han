import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "경비 정산 검사기 | 한결인테리어",
  description: "경비 내역 CSV 파일을 올리면 회사 경비 규정 위반 여부를 자동으로 검사합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
