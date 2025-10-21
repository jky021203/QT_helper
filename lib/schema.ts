import { z } from "zod";

const VERSE_REGEX =
  /^([가-힣A-Za-z0-9\s]+?)\s*(\d{1,3})(?:\s*(?:장|편))?(?:\s*[:\s]\s*)(\d{1,3})(?:\s*(?:절)?)?$/;

const stripQuotes = (value: string) =>
  value.replace(/["“”'’‛‹›«»「」『』]/g, "");

export const normalizeVerseInput = (raw: string): string | null => {
  const sanitized = stripQuotes(raw).trim();
  if (!sanitized) {
    return null;
  }

  const compacted = sanitized.replace(/\s+/g, " ");
  const match = compacted.match(VERSE_REGEX);

  if (!match) {
    return null;
  }

  const [, book, chapter, verse] = match;
  const normalizedBook = book.replace(/\s+/g, " ").trim();

  if (!normalizedBook) {
    return null;
  }

  return `${normalizedBook} ${chapter}:${verse}`;
};

const baseVerseInputSchema = z.object({
  verseInput: z.string().min(1, "성경 구절을 입력해 주세요.")
});

export const verseInputSchema = baseVerseInputSchema.transform((data, ctx) => {
  const normalized = normalizeVerseInput(data.verseInput);

  if (!normalized) {
    ctx.addIssue({
      path: ["verseInput"],
      code: z.ZodIssueCode.custom,
      message:
        "구절은 예: 마가복음 10:27, 마가복음 1장 1절, 시편 23편 1절 형식으로 입력해 주세요."
    });
    return z.NEVER;
  }

  return { verseInput: normalized };
});

export const lumiResultSchema = baseVerseInputSchema
  .extend({
    background: z.string(),
    keywords: z
      .array(
        z.object({
          term: z.string(),
          meaning: z.string()
        })
      )
      .length(3),
    relatedVerses: z
      .array(
        z.object({
          reference: z.string(),
          reason: z.string()
        })
      )
      .min(2)
      .max(3),
    reflections: z.array(z.string()).length(3),
    prayer: z.string()
  })
  .transform((data, ctx) => {
    const normalized = normalizeVerseInput(data.verseInput);
    if (!normalized) {
      ctx.addIssue({
        path: ["verseInput"],
        code: z.ZodIssueCode.custom,
        message: "verseInput은 예: 마가복음 1:1 형식으로 전달되어야 해요."
      });
      return z.NEVER;
    }

    return {
      ...data,
      verseInput: normalized
    };
  });

export type LumiResponse = z.infer<typeof lumiResultSchema>;

export type LumiHistoryItem = {
  verseInput: string;
  response: Omit<LumiResponse, "verseInput">;
  timestamp: number;
};

export const MAX_HISTORY = 3;
