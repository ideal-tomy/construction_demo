import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 90;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ReviewFieldSchema = z.object({
  path: z.string(),
  reason: z.string()
});

const OcrFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(100),
  needsReview: z.boolean()
});

const OcrDetailSchema = z.object({
  documentType: z.string(),
  summary: z.string(),
  fields: z.array(OcrFieldSchema).min(1),
  warnings: z.array(z.string())
});

const ReportDraftSchema = z.object({
  templateId: z.literal("site_daily_report_v1"),
  title: z.string(),
  header: z.object({
    projectName: z.string(),
    siteName: z.string(),
    date: z.string(),
    reporter: z.string(),
    weather: z.string()
  }),
  sections: z.object({
    workSummary: z.string(),
    progress: z.string(),
    materials: z.string(),
    safety: z.string(),
    photoFindings: z.string(),
    nextPlan: z.string(),
    requests: z.string()
  }),
  reviewFields: z.array(ReviewFieldSchema),
  ocrDetail: OcrDetailSchema.optional()
});

const ToolboxBriefingSchema = z.object({
  templateId: z.literal("morning_briefing_v1"),
  title: z.string(),
  date: z.string(),
  siteName: z.string(),
  summary: z.string(),
  focusWorks: z.array(z.string()).min(1),
  safetyPoints: z.array(z.string()).min(1),
  cautionAreas: z.array(z.string()).min(1),
  talkScripts: z.array(z.string()).min(1),
  reviewFields: z.array(ReviewFieldSchema),
  ocrDetail: OcrDetailSchema.optional()
});

function safeJsonParse(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(cleaned);
}

function reportPrompt() {
  return `次のJSON形式だけを返してください。画像に見える事実を優先し、不明な欄は「要確認」と書いて reviewFields に path を追加してください。
path 例: header.weather / sections.requests

{
  "templateId": "site_daily_report_v1",
  "title": "現場状況報告書（日報）",
  "header": {
    "projectName": "案件名",
    "siteName": "現場名",
    "date": "YYYY-MM-DD",
    "reporter": "報告者（不明なら空欄可）",
    "weather": "天候"
  },
  "sections": {
    "workSummary": "本日の作業内容",
    "progress": "進捗・完了状況",
    "materials": "使用資材・機材",
    "safety": "安全・ヒヤリハット",
    "photoFindings": "写真所見",
    "nextPlan": "翌日予定",
    "requests": "要請事項"
  },
  "reviewFields": [{ "path": "sections.requests", "reason": "理由" }],
  "ocrDetail": {
    "documentType": "現場写真セット",
    "summary": "短い要約",
    "fields": [
      {
        "key": "work_type",
        "label": "作業種別",
        "value": "値",
        "confidence": 90,
        "needsReview": false
      }
    ],
    "warnings": []
  }
}`;
}

function toolboxPrompt() {
  return `次のJSON形式だけを返してください。建設現場の朝礼で読み上げる短いメモにしてください。安全ポイントを最重視してください。
不明点は reviewFields に path（focusWorks / safetyPoints / cautionAreas / talkScripts / summary など）を追加してください。

{
  "templateId": "morning_briefing_v1",
  "title": "本日の朝礼メモ（下書き）",
  "date": "YYYY-MM-DD",
  "siteName": "現場名",
  "summary": "3行以内のサマリ",
  "focusWorks": ["重点作業"],
  "safetyPoints": ["安全ポイント"],
  "cautionAreas": ["注意箇所"],
  "talkScripts": ["声かけ例"],
  "reviewFields": [{ "path": "cautionAreas", "reason": "理由" }],
  "ocrDetail": {
    "documentType": "朝礼用現場写真",
    "summary": "短い要約",
    "fields": [
      {
        "key": "main_hazard",
        "label": "主要リスク",
        "value": "値",
        "confidence": 90,
        "needsReview": false
      }
    ],
    "warnings": []
  }
}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY が設定されていません。サンプル再生ならキー不要です。"
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const mode = String(formData.get("mode") || "");

    if (mode !== "report" && mode !== "toolbox") {
      return NextResponse.json(
        { error: "mode は report または toolbox を指定してください。" },
        { status: 400 }
      );
    }

    const uploaded = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (!uploaded.length) {
      return NextResponse.json(
        { error: "画像ファイルを1枚以上選択してください。" },
        { status: 400 }
      );
    }

    if (uploaded.length > MAX_FILES) {
      return NextResponse.json(
        { error: `画像は最大${MAX_FILES}枚までです。` },
        { status: 400 }
      );
    }

    let totalSize = 0;
    for (const file of uploaded) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "JPG、PNG、WebP形式の画像を選択してください。" },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "各ファイルは10MB以下にしてください。" },
          { status: 400 }
        );
      }
      totalSize += file.size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: "画像の合計サイズは25MB以下にしてください。" },
        { status: 400 }
      );
    }

    const imageContents = await Promise.all(
      uploaded.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
        return {
          type: "input_image" as const,
          image_url: dataUrl,
          detail: "high" as const
        };
      })
    );

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const systemText =
      mode === "report"
        ? [
            "あなたは建設現場向けの報告書下書き作成エンジンです。",
            "複数の現場写真から、日本語の日報テンプレート各欄を埋めてください。",
            "見える事実を優先し、推測は最小限にして reviewFields で明示してください。",
            "必ず指定JSON形式だけを返してください。"
          ].join("\n")
        : [
            "あなたは建設現場の朝礼メモ作成エンジンです。",
            "現場写真から、朝礼で読み上げる短いメモを日本語で作成してください。",
            "安全ポイントを最も重視してください。",
            "必ず指定JSON形式だけを返してください。"
          ].join("\n");

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "tpt-5-nano",
      temperature: 0,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemText }]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: mode === "report" ? reportPrompt() : toolboxPrompt()
            },
            ...imageContents
          ]
        }
      ]
    });

    const rawText = response.output_text;
    if (!rawText) {
      throw new Error("AIから下書き結果が返されませんでした。");
    }

    const parsed = safeJsonParse(rawText);
    const draft =
      mode === "report"
        ? ReportDraftSchema.parse(parsed)
        : ToolboxBriefingSchema.parse(parsed);

    return NextResponse.json({
      ...draft,
      sourceImages: uploaded.map((file) => ({
        name: file.name,
        previewUrl: ""
      })),
      meta: {
        mode,
        fileCount: uploaded.length,
        filenames: uploaded.map((file) => file.name)
      }
    });
  } catch (error) {
    console.error("Generate API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            "AIの返却形式が不正でした。別の画像セットで再度お試しください。"
        },
        { status: 500 }
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "下書き作成中にエラーが発生しました。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
