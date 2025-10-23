import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import {
  lumiResultSchema,
  verseInputSchema,
  SelahResponse
} from "@/lib/schema";
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from "@/lib/prompts";
import bibleData from "@/bible.json";
import { buildNormalizedKey } from "@/lib/schema";

const LUMI_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["verseInput", "background", "keywords", "relatedVerses", "reflections", "prayer"],
  properties: {
    verseInput: {
      type: "string",
      description: "사용자가 입력한 성경 구절"
    },
    background: {
      type: "string",
      description: "본문의 역사적/문화적 배경 설명"
    },
    keywords: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["term", "meaning"],
        properties: {
          term: { type: "string" },
          meaning: { type: "string" }
        }
      }
    },
    relatedVerses: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["reference", "reason"],
        properties: {
          reference: { type: "string" },
          reason: { type: "string" }
        }
      }
    },
    reflections: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    },
    prayer: {
      type: "string"
    }
  }
} as const;

const fallbackResponse = (verseInput: string): SelahResponse => ({
  verseInput,
  background:
    "이 구절은 하나님께서 인간으로서는 불가능해 보이는 일도 이루실 수 있다는 희망을 전합니다. 특히 제자들이 제시한 의문에 대한 예수님의 응답으로, 구원은 사람의 노력보다 하나님의 은혜로 가능함을 보여 줍니다.",
  keywords: [
    {
      term: "하나님",
      meaning: "모든 가능성과 능력의 근원이자 구원을 완성하시는 분."
    },
    {
      term: "불가능",
      meaning: "인간의 한계 속에서 발견되는, 하나님께 맡겨야 할 영역."
    },
    {
      term: "은혜",
      meaning: "사람의 조건과 상관없이 하나님이 베푸시는 구원의 선물."
    }
  ],
  relatedVerses: [
    {
      reference: "창세기 18:14",
      reason: "아브라함과 사라에게 주신 약속처럼, 하나님께는 불가능이 없음을 상기시킵니다."
    },
    {
      reference: "예레미야 32:17",
      reason: "창조주 하나님의 전능하심을 고백하며 믿음의 시선을 돌려 줍니다."
    },
    {
      reference: "에베소서 2:8-9",
      reason: "구원이 인간의 행위가 아닌 하나님의 은혜로 주어짐을 확인해 줍니다."
    }
  ],
  reflections: [
    "나는 지금 인간적인 계산으로만 포기해 버린 기도 제목이 있는가?",
    "하나님의 은혜가 아니고는 얻을 수 없던 구원의 확신을 어떻게 누리고 있는가?",
    "불가능하다고 느끼는 상황 속에서 하나님께 어떤 순종을 드릴 수 있을까?"
  ],
  prayer:
    "주님, 사람에게는 불가능해 보이는 상황 속에서도 주님의 은혜와 능력을 바라보며 믿음으로 순종하게 해 주세요.",
  verseText: "개역개정 본문을 불러오지 못했습니다."
});

const responseWrapper = <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  payload: T,
  status = 200
) => NextResponse.json(payload, { status });

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return responseWrapper({ success: false, error: "올바른 JSON 형식이 필요해요." }, 400);
  }

  const parsedInput = verseInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return responseWrapper(
      { success: false, error: parsedInput.error.issues[0]?.message ?? "입력값을 확인해 주세요." },
      400
    );
  }

  const { verseInput } = parsedInput.data;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Provide a deterministic fallback so the UI remains testable in development.
    return responseWrapper({
      success: true,
      data: fallbackResponse(verseInput),
      warning: "OPENAI_API_KEY가 설정되지 않아 예시 응답을 반환했어요.",
      fallback: true
    });
  }

  try {
    const normalizedKey = buildNormalizedKey(verseInput);
    let verseText: string | undefined;

    if (normalizedKey in (bibleData as Record<string, string>)) {
      verseText = (bibleData as Record<string, string>)[normalizedKey].trim();
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lumi_schema",
          schema: LUMI_JSON_SCHEMA,
          strict: true
        }
      },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: USER_PROMPT_TEMPLATE(verseInput)
        }
      ]
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error("모델에서 응답을 받지 못했어요.");
    }

    const parsedJson = z
      .string()
      .transform((data) => JSON.parse(data))
      .pipe(lumiResultSchema)
      .parse(rawContent);

    const responsePayload: SelahResponse = {
      ...parsedJson,
      verseInput,
      verseText:
        verseText ??
        parsedJson.verseText ??
        "개역개정 본문을 불러오지 못했습니다."
    };

    return responseWrapper({ success: true, data: responsePayload });
  } catch (error) {
    console.error("[lumi-route] error", error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 429 || error.status === 402) {
        return responseWrapper({
          success: true,
          data: fallbackResponse(verseInput),
          warning: "OpenAI 호출 제한으로 예시 응답을 반환했어요.",
          fallback: true
        });
      }

      return responseWrapper(
        {
          success: false,
          error: error.message ?? "OpenAI 호출 중 오류가 발생했어요."
        },
        error.status ?? 500
      );
    }

    if (error instanceof z.ZodError) {
      return responseWrapper(
        {
          success: false,
          error: "모델 응답이 예상한 형식을 벗어났어요. 다시 시도해 주세요."
        },
        500
      );
    }

    return responseWrapper(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Selah가 지금은 응답할 수 없어요. 잠시 후 다시 시도해 주세요."
      },
      500
    );
  }
}
