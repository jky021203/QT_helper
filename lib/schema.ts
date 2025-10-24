import { z } from "zod";

const VERSE_REGEX =
  /^([가-힣A-Za-z0-9\s]+?)\s*(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?$/;

const BOOK_ABBREVIATIONS: Record<string, string> = {
  창세기: "창",
  출애굽기: "출",
  레위기: "레",
  민수기: "민",
  신명기: "신",
  여호수아: "수",
  사사기: "삿",
  룻기: "룻",
  사무엘상: "삼상",
  사무엘하: "삼하",
  열왕기상: "왕상",
  열왕기하: "왕하",
  역대상: "대상",
  역대하: "대하",
  에스라: "스",
  느헤미야: "느",
  에스더: "에",
  욥기: "욥",
  시편: "시",
  잠언: "잠",
  전도서: "전",
  아가: "아",
  이사야: "사",
  예레미야: "렘",
  예레미야애가: "애",
  에스겔: "겔",
  다니엘: "단",
  호세아: "호",
  요엘: "욜",
  아모스: "암",
  오바댜: "옵",
  요나: "욘",
  미가: "미",
  나훔: "나",
  하박국: "합",
  스바냐: "습",
  학개: "학",
  스가랴: "슥",
  말라기: "말",
  마태복음: "마",
  마가복음: "막",
  누가복음: "눅",
  요한복음: "요",
  사도행전: "행",
  로마서: "롬",
  고린도전서: "고전",
  고린도후서: "고후",
  갈라디아서: "갈",
  에베소서: "엡",
  빌립보서: "빌",
  골로새서: "골",
  데살로니가전서: "살전",
  데살로니가후서: "살후",
  디모데전서: "딤전",
  디모데후서: "딤후",
  디도서: "딛",
  빌레몬서: "몬",
  히브리서: "히",
  야고보서: "약",
  베드로전서: "벧전",
  베드로후서: "벧후",
  요한일서: "요일",
  요한이서: "요이",
  요한삼서: "요삼",
  유다서: "유",
  요한계시록: "계"
};

const stripQuotes = (value: string) =>
  value.replace(/["“”'’‛‹›«»「」『』]/g, "");

export type ParsedVerseRange = {
  book: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
};

const normaliseRawInput = (raw: string) =>
  raw
    .replace(/\s+/g, " ")
    .replace(/(\d+)\s*장\s*(\d+)/g, "$1:$2")
    .replace(/(\d+)\s*장/g, "$1")
    .replace(/(\d+)\s*절/g, "$1")
    .replace(/[~]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .trim();

export const parseVerseRange = (raw: string): ParsedVerseRange | null => {
  const sanitized = stripQuotes(raw).trim();
  if (!sanitized) {
    return null;
  }

  const compacted = normaliseRawInput(sanitized);
  const match = compacted.match(VERSE_REGEX);

  if (!match) {
    return null;
  }

  const [, bookRaw, chapterRaw, startVerseRaw, endVerseRaw] = match;
  const book = bookRaw.replace(/\s+/g, " ").trim();
  if (!book) {
    return null;
  }

  const chapter = Number(chapterRaw);
  if (Number.isNaN(chapter)) {
    return null;
  }

  const startVerse = startVerseRaw ? Number(startVerseRaw) : undefined;
  const endVerse = endVerseRaw
    ? Number(endVerseRaw)
    : undefined;

  if (startVerse !== undefined && Number.isNaN(startVerse)) {
    return null;
  }
  if (endVerse !== undefined && Number.isNaN(endVerse)) {
    return null;
  }
  if (
    startVerse !== undefined &&
    endVerse !== undefined &&
    endVerse < startVerse
  ) {
    return null;
  }

  return {
    book,
    chapter,
    startVerse,
    endVerse: endVerse ?? startVerse
  };
};

export const formatVerseRange = (parsed: ParsedVerseRange): string => {
  const { book, chapter, startVerse, endVerse } = parsed;
  if (startVerse === undefined) {
    return `${book} ${chapter}`;
  }
  if (endVerse && endVerse !== startVerse) {
    return `${book} ${chapter}:${startVerse}-${endVerse}`;
  }
  return `${book} ${chapter}:${startVerse}`;
};

export const getBookAbbreviation = (book: string): string =>
  BOOK_ABBREVIATIONS[book.replace(/\s+/g, "")] ?? book.replace(/\s+/g, "");

const baseVerseInputSchema = z.object({
  verseInput: z.string().min(1, "성경 구절을 입력해 주세요.")
});

export const verseInputSchema = baseVerseInputSchema.transform((data, ctx) => {
  const parsed = parseVerseRange(data.verseInput);

  if (!parsed) {
    ctx.addIssue({
      path: ["verseInput"],
      code: z.ZodIssueCode.custom,
      message:
        "구절은 예: 마가복음 10:27, 마가복음 1장 1절, 시편 23편 1절, 마태복음 5장 1절-4절 형식으로 입력해 주세요."
    });
    return z.NEVER;
  }

  return { verseInput: formatVerseRange(parsed) };
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
    prayer: z.string(),
    verseText: z.string().optional()
  })
  .transform((data, ctx) => {
    const parsed = parseVerseRange(data.verseInput);
    if (!parsed) {
      ctx.addIssue({
        path: ["verseInput"],
        code: z.ZodIssueCode.custom,
        message: "verseInput은 예: 마가복음 1:1 형식으로 전달되어야 해요."
      });
      return z.NEVER;
    }

    return {
      ...data,
      verseInput: formatVerseRange(parsed)
    };
  });

export type SelahResponse = z.infer<typeof lumiResultSchema>;

export type SelahHistoryItem = {
  verseInput: string;
  response: Omit<SelahResponse, "verseInput">;
  timestamp: number;
};

export const MAX_HISTORY = 3;
