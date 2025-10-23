"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { HistoryList } from "@/components/history-list";
import { ResultSections } from "@/components/result-sections";
import {
  verseInputSchema,
  SelahHistoryItem,
  SelahResponse,
  MAX_HISTORY
} from "@/lib/schema";

const LOCAL_STORAGE_KEY = "lumi-history";

type SelahApiResponse = {
  success: boolean;
  data?: Omit<SelahResponse, "verseInput"> & { verseInput: string };
  error?: string;
  warning?: string;
  fallback?: boolean;
};

const heroText = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

export default function Page() {
  const [verse, setVerse] = useState("");
  const [result, setResult] =
    useState<Omit<SelahResponse, "verseInput"> | null>(null);
  const [history, setHistory] = useState<SelahHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      return;
    }
    try {
      const parsed: SelahHistoryItem[] = JSON.parse(stored);
      setHistory(parsed);
    } catch {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const handleHistorySelect = useCallback((item: SelahHistoryItem) => {
    setVerse(item.verseInput);
    setResult(item.response);
    setError(null);
  }, []);

  const pushHistory = useCallback((entry: SelahHistoryItem) => {
    setHistory((prev) => {
      const next = [entry, ...prev.filter((item) => item.verseInput !== entry.verseInput)];
      return next.slice(0, MAX_HISTORY);
    });
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const parsed = verseInputSchema.safeParse({ verseInput: verse });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "입력 형식을 다시 확인해 주세요.");
        return;
      }

      const normalizedVerse = parsed.data.verseInput;

      if (normalizedVerse !== verse) {
        setVerse(normalizedVerse);
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/lumi", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.NEXT_PUBLIC_VERCEL_BYPASS_TOKEN
              ? {
                  "x-vercel-protection-bypass":
                    process.env.NEXT_PUBLIC_VERCEL_BYPASS_TOKEN
                }
              : {})
          },
          body: JSON.stringify({ verseInput: normalizedVerse })
        });

        if (!res.ok) {
          throw new Error("Selah와 연결에 실패했어요. 잠시 후 다시 시도해 주세요.");
        }

        const json = (await res.json()) as SelahApiResponse;
        if (!json.success || !json.data) {
          throw new Error(json.error ?? "응답을 불러오지 못했어요.");
        }

        const { verseInput, ...rest } = json.data;
        const historyEntry: SelahHistoryItem = {
          verseInput,
          response: rest,
          timestamp: Date.now()
        };
        if (verseInput !== normalizedVerse) {
          setVerse(verseInput);
        }
        setResult(rest);
        pushHistory(historyEntry);
        if (json.warning) {
          setError(json.warning);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "알 수 없는 오류가 발생했어요. 다시 시도해 주세요.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [verse, pushHistory]
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-8">
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-8">
        <Image
          src="/selah-logo.svg"
          alt="Selah 로고"
          width={235}
          height={73}
          priority
          className="select-none"
        />
        <div className="w-full max-w-[820px]">
          <h1 className="sr-only">Selah – 말씀 묵상 챗봇</h1>
          <motion.form
            variants={heroText}
            initial="initial"
            animate="animate"
            onSubmit={handleSubmit}
            className="w-full"
          >
            <label className="sr-only" htmlFor="verseInput">
              성경 구절 검색
            </label>
            <input
              id="verseInput"
              name="verseInput"
              value={verse}
              onChange={(event) => setVerse(event.target.value)}
              placeholder="성경 구절 검색 (예: 시편 23편 1절)"
              className="w-full rounded-full border border-[#D7D2B1] bg-white/92 py-4 pl-14 pr-6 text-base text-selah-ink shadow-[0_18px_40px_-28px_rgba(47,43,74,0.65)] placeholder:text-selah-ink/40 focus:border-selah-ink focus:outline-none focus:ring-2 focus:ring-selah-ink/15"
              autoComplete="off"
              style={{
                backgroundImage: "url('/search-icon.svg')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "24px center",
                backgroundSize: "20px 20px"
              }}
            />
          </motion.form>
        </div>
      </div>

      {error && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      <HistoryList history={history} onSelect={handleHistorySelect} />

      <ResultSections data={result} verse={verse} isLoading={isLoading} />
    </div>
  );
}
