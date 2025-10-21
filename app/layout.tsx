import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { ReactNode } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Lumi – 말씀 묵상 챗봇",
  description:
    "초신자를 위한 큐티 도우미 루미. 성경 구절을 입력하면 배경 설명부터 기도문까지 순차 제공해요."
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ko" className={`${playfair.variable}`}>
      <body className="bg-cream text-slate-900 antialiased">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 pb-24 pt-10">
          {children}
        </main>
      </body>
    </html>
  );
}
