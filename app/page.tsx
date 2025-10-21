"use client";

import { useCallback, useEffect, useMemo, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { HistoryList } from "@/components/history-list";
import { ResultSections } from "@/components/result-sections";
import {
  verseInputSchema,
  LumiHistoryItem,
  LumiResponse,
  MAX_HISTORY
} from "@/lib/schema";

const LOCAL_STORAGE_KEY = "lumi-history";

type LumiApiResponse = {
  success: boolean;
  data?: Omit<LumiResponse, "verseInput"> & { verseInput: string };
  error?: string;
};

const heroText = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

export default function Page() {
  const [verse, setVerse] = useState("");
  const [result, setResult] =
    useState<Omit<LumiResponse, "verseInput"> | null>(null);
  const [history, setHistory] = useState<LumiHistoryItem[]>([]);
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
      const parsed: LumiHistoryItem[] = JSON.parse(stored);
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

  const isSubmitDisabled = useMemo(
    () => verse.trim().length === 0 || isLoading,
    [verse, isLoading]
  );

  const handleHistorySelect = useCallback((item: LumiHistoryItem) => {
    setVerse(item.verseInput);
    setResult(item.response);
    setError(null);
  }, []);

  const pushHistory = useCallback((entry: LumiHistoryItem) => {
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
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ verseInput: normalizedVerse })
        });

        if (!res.ok) {
          throw new Error("루미와 연결에 실패했어요. 잠시 후 다시 시도해 주세요.");
        }

        const json = (await res.json()) as LumiApiResponse;
        if (!json.success || !json.data) {
          throw new Error(json.error ?? "응답을 불러오지 못했어요.");
        }

        const { verseInput, ...rest } = json.data;
        const historyEntry: LumiHistoryItem = {
          verseInput,
          response: rest,
          timestamp: Date.now()
        };
        if (verseInput !== normalizedVerse) {
          setVerse(verseInput);
        }
        setResult(rest);
        pushHistory(historyEntry);
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
    <div className="pb-16">
      <header className="text-center">
        <motion.h1
          variants={heroText}
          initial="initial"
          animate="animate"
          className="font-display text-4xl font-semibold text-slate-900 md:text-5xl"
        >
          Lumi – 말씀 묵상 챗봇
        </motion.h1>
        <motion.p
          variants={heroText}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="mt-4 text-base text-slate-600 md:text-lg"
        >
          “말씀을 이해하는 첫 걸음, 루미가 함께합니다.”
        </motion.p>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-10 rounded-3xl bg-white/90 p-6 shadow-card ring-1 ring-sage/25 backdrop-blur-sm md:p-8"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 md:flex-row md:items-center"
        >
          <label className="sr-only" htmlFor="verseInput">
            성경 구절
          </label>
          <input
            id="verseInput"
            name="verseInput"
            value={verse}
            onChange={(event) => setVerse(event.target.value)}
            placeholder="예) 마가복음 10:27"
            className="flex-1 rounded-2xl border border-sage/30 bg-white px-4 py-3 text-base text-slate-800 shadow-sm transition focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="inline-flex items-center justify-center rounded-2xl bg-sage px-5 py-3 text-base font-medium text-white shadow-sm transition hover:bg-sage/90 disabled:cursor-not-allowed disabled:bg-sage/40"
          >
            묵상 생성하기
          </button>
        </form>

        <p className="mt-3 text-xs text-slate-500">
          루미는 GPT-4o-mini를 활용해 배경 설명부터 기도문까지 5단계로 응답을
          구성해요.
        </p>
      </motion.section>

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
