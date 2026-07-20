"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import type { OcrField, OcrResult } from "@/lib/types";

type ApiResult = OcrResult & {
  meta?: {
    filename: string;
    mimeType: string;
    size: number;
  };
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "json" | "csv">("form");
  const [status, setStatus] = useState<
    "idle" | "uploading" | "reading" | "structuring" | "done" | "error"
  >("idle");
  const [error, setError] = useState("");

  const progress = {
    idle: 0,
    uploading: 20,
    reading: 50,
    structuring: 80,
    done: 100,
    error: 0
  }[status];

  const averageConfidence = useMemo(() => {
    if (!result?.fields.length) return 0;
    return Math.round(
      result.fields.reduce((sum, field) => sum + field.confidence, 0) /
        result.fields.length
    );
  }, [result]);

  const reviewCount = useMemo(
    () => result?.fields.filter((field) => field.needsReview).length ?? 0,
    [result]
  );

  function validateFile(nextFile: File): string | null {
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      return "JPG、PNG、WebP形式の画像を選択してください。";
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      return "ファイルサイズは10MB以下にしてください。";
    }

    return null;
  }

  function selectFile(nextFile: File) {
    const validationError = validateFile(nextFile);

    if (validationError) {
      setError(validationError);
      setStatus("error");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setResult(null);
    setError("");
    setStatus("idle");
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) selectFile(selected);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) selectFile(dropped);
  }

  async function analyze() {
    if (!file) {
      setError("解析する画像を選択してください。");
      setStatus("error");
      return;
    }

    setError("");
    setResult(null);
    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const readingTimer = window.setTimeout(() => setStatus("reading"), 500);
      const structuringTimer = window.setTimeout(
        () => setStatus("structuring"),
        1800
      );

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData
      });

      window.clearTimeout(readingTimer);
      window.clearTimeout(structuringTimer);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "解析に失敗しました。");
      }

      setResult(data);
      setStatus("done");
      setActiveTab("form");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "解析に失敗しました。"
      );
      setStatus("error");
    }
  }

  function updateField(index: number, value: string) {
    setResult((current) => {
      if (!current) return current;

      const fields = current.fields.map((field, fieldIndex) =>
        fieldIndex === index
          ? {
              ...field,
              value,
              needsReview: false,
              confidence: Math.max(field.confidence, 90)
            }
          : field
      );

      return { ...current, fields };
    });
  }

  function objectData() {
    return Object.fromEntries(
      (result?.fields ?? []).map((field) => [field.key, field.value])
    );
  }

  function csvData() {
    const escapeCsv = (value: string) =>
      `"${String(value).replaceAll('"', '""')}"`;

    return [
      ["key", "項目名", "値", "信頼度", "要確認"],
      ...(result?.fields ?? []).map((field) => [
        field.key,
        field.label,
        field.value,
        String(field.confidence),
        field.needsReview ? "はい" : "いいえ"
      ])
    ]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
  }

  function download(filename: string, text: string, type: string) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  const statusText = {
    idle: "画像を選択してください",
    uploading: "画像をアップロードしています…",
    reading: "文字とレイアウトを読み取っています…",
    structuring: "項目を構造化しています…",
    done: "解析が完了しました",
    error: "エラーが発生しました"
  }[status];

  const isAnalyzing =
    status === "uploading" ||
    status === "reading" ||
    status === "structuring";

  return (
    <main>
      <div className="shell">
        <header className="hero">
          <div>
            <span className="eyebrow">AI DOCUMENT PROCESSING</span>
            <h1>帳票を、使えるデータへ。</h1>
            <p>
              紙帳票や写真をアップロードすると、AIが内容を読み取り、
              編集可能な構造化データへ変換します。
            </p>
          </div>
          <span className="demoBadge">体験デモ</span>
        </header>

        <aside className="notice" role="note">
          <strong>ご利用上の注意</strong>
          デモ用途では機密情報・個人情報を含む帳票をアップロードしないでください。
          画像はサーバーに保存せず、解析のためにAI APIへ送信したあと破棄されます。
        </aside>

        {result && (
          <section className="metrics" aria-label="解析結果の概要">
            <Metric label="帳票種類" value={result.documentType} />
            <Metric label="検出項目" value={`${result.fields.length}件`} />
            <Metric label="平均信頼度" value={`${averageConfidence}%`} />
            <Metric label="要確認" value={`${reviewCount}件`} />
          </section>
        )}

        <section className="workspace">
          <div className="leftColumn">
            <div className="panelHeader">
              <div>
                <h2>帳票画像</h2>
                <p>JPG・PNG・WebP / 最大10MB</p>
              </div>
              {file && (
                <button className="textButton" type="button" onClick={reset}>
                  選び直す
                </button>
              )}
            </div>

            {!previewUrl ? (
              <div
                className="dropZone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    inputRef.current?.click();
                  }
                }}
              >
                <div className="uploadIcon">↑</div>
                <strong>画像をドロップ</strong>
                <span>またはクリックして選択</span>
                <button type="button">画像を選択</button>
              </div>
            ) : (
              <div className="preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="アップロードした帳票のプレビュー" />
              </div>
            )}

            <input
              ref={inputRef}
              className="hiddenInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
            />

            {file && (
              <div className="fileInfo">
                <div>
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button
                  className="primaryButton"
                  type="button"
                  onClick={analyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "解析中…" : "AIで帳票を解析"}
                </button>
              </div>
            )}

            {(status !== "idle" || error) && (
              <div className={`statusBox ${status === "error" ? "error" : ""}`}>
                <div className="statusLine">
                  <span>{error || statusText}</span>
                  {!error && <strong>{progress}%</strong>}
                </div>
                {!error && (
                  <div className="progressTrack">
                    <div
                      className="progressBar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rightColumn">
            <div className="panelHeader">
              <div>
                <h2>抽出結果</h2>
                <p>値をクリックして修正できます</p>
              </div>
              {result && <span className="successBadge">解析済み</span>}
            </div>

            {!result ? (
              <div className="emptyState">
                <div className="emptyIcon">◎</div>
                <strong>解析結果がここに表示されます</strong>
                <span>
                  左側から帳票画像をアップロードし、
                  「AIで帳票を解析」を押してください。
                </span>
              </div>
            ) : (
              <>
                <div className="resultSummary">
                  <div>
                    <span>判定された帳票</span>
                    <strong>{result.documentType}</strong>
                  </div>
                  <p>{result.summary}</p>
                </div>

                <div className="tabs" role="tablist">
                  {(["form", "json", "csv"] as const).map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      className={activeTab === tab ? "active" : ""}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "form"
                        ? "フォーム"
                        : tab === "json"
                          ? "JSON"
                          : "CSV"}
                    </button>
                  ))}
                </div>

                {activeTab === "form" && (
                  <div className="fieldList">
                    {result.fields.map((field, index) => (
                      <FieldEditor
                        key={`${field.key}-${index}`}
                        field={field}
                        onChange={(value) => updateField(index, value)}
                      />
                    ))}
                  </div>
                )}

                {activeTab === "json" && (
                  <pre>{JSON.stringify(objectData(), null, 2)}</pre>
                )}

                {activeTab === "csv" && <pre>{csvData()}</pre>}

                {result.warnings.length > 0 && (
                  <div className="warningBox">
                    <strong>確認事項</strong>
                    <ul>
                      {result.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="downloadActions">
                  <button
                    type="button"
                    onClick={() =>
                      download(
                        "ocr-result.json",
                        JSON.stringify(objectData(), null, 2),
                        "application/json"
                      )
                    }
                  >
                    JSONを出力
                  </button>
                  <button
                    className="primaryButton"
                    type="button"
                    onClick={() =>
                      download(
                        "ocr-result.csv",
                        `\uFEFF${csvData()}`,
                        "text/csv;charset=utf-8"
                      )
                    }
                  >
                    CSVをダウンロード
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <footer>
          <span>
            アップロード画像はサーバーに保存されず、解析のためAI
            APIへ送信されます。
          </span>
          <span>デモ用途では機密情報を含む帳票を使用しないでください。</span>
        </footer>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FieldEditor({
  field,
  onChange
}: {
  field: OcrField;
  onChange: (value: string) => void;
}) {
  const multiline = field.value.length > 40;

  return (
    <label className={`field ${field.needsReview ? "needsReview" : ""}`}>
      <div className="fieldLabel">
        <span>{field.label}</span>
        <span className={field.needsReview ? "reviewBadge" : "confidence"}>
          {field.confidence}%
          {field.needsReview ? "・要確認" : ""}
        </span>
      </div>
      {multiline ? (
        <textarea
          value={field.value}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          value={field.value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}
