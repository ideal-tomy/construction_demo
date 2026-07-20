import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const OcrFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(100),
  needsReview: z.boolean()
});

const OcrResultSchema = z.object({
  documentType: z.string(),
  summary: z.string(),
  fields: z.array(OcrFieldSchema).min(1),
  warnings: z.array(z.string())
});

function safeJsonParse(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(cleaned);
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY が設定されていません。" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const uploaded = formData.get("file");

    if (!(uploaded instanceof File)) {
      return NextResponse.json(
        { error: "画像ファイルを選択してください。" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(uploaded.type)) {
      return NextResponse.json(
        { error: "JPG、PNG、WebP形式の画像を選択してください。" },
        { status: 400 }
      );
    }

    if (uploaded.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ファイルサイズは10MB以下にしてください。" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await uploaded.arrayBuffer());
    const dataUrl = `data:${uploaded.type};base64,${buffer.toString("base64")}`;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "あなたは日本語帳票のOCR・構造化抽出エンジンです。",
                "画像内に実際に見える情報だけを抽出してください。",
                "推測で値を補完しないでください。",
                "帳票種類を判定し、業務上重要な項目を抽出してください。",
                "confidenceは読み取り確度を0〜100の整数で返してください。",
                "不鮮明・判読困難・曖昧な値はneedsReviewをtrueにしてください。",
                "空の項目は原則として返さないでください。",
                "keyは英小文字のsnake_case、labelは日本語にしてください。",
                "必ず指定JSON形式だけを返してください。"
              ].join("\n")
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `次のJSON形式で帳票を解析してください。

{
  "documentType": "帳票種類",
  "summary": "帳票内容の短い要約",
  "fields": [
    {
      "key": "field_key",
      "label": "項目名",
      "value": "抽出値",
      "confidence": 95,
      "needsReview": false
    }
  ],
  "warnings": ["確認事項"]
}`
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: "high"
            }
          ]
        }
      ]
    });

    const rawText = response.output_text;

    if (!rawText) {
      throw new Error("AIから解析結果が返されませんでした。");
    }

    const parsed = OcrResultSchema.parse(safeJsonParse(rawText));

    return NextResponse.json({
      ...parsed,
      meta: {
        filename: uploaded.name,
        mimeType: uploaded.type,
        size: uploaded.size
      }
    });
  } catch (error) {
    console.error("OCR API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            "AIの返却形式が不正でした。別の画像で再度お試しください。"
        },
        { status: 500 }
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "帳票の解析中にエラーが発生しました。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
