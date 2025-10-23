import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { ReactNode } from "react";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "Selah – 말씀 묵상 챗봇",
  description:
    "초신자를 위한 큐티 도우미 Selah. 성경 구절을 입력하면 배경 설명부터 기도문까지 순차 제공해요."
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ko" className={notoSansKr.className}>
      <body className="bg-selah-sun text-selah-ink antialiased">
        <main
          className="relative flex min-h-screen w-full flex-col"
          style={{
            backgroundImage: "url('/selah-bg.svg')",
            backgroundSize: "100% auto",
            backgroundPosition: "top center",
            backgroundRepeat: "no-repeat"
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
