"use client";

import { useEffect, useState } from "react";
import type { OcrField, OcrResult } from "@/lib/types";

type Props = {
  ocrDetail?: OcrResult;
};

export function DetailDataPanel({ ocrDetail }: Props) {
  const [activeTab, setActiveTab] = useState<"form" | "json" | "csv">("form");
  const [fields, setFields] = useState<OcrField[]>(ocrDetail?.fields ?? []);

  useEffect(() => {
    setFields(ocrDetail?.fields ?? []);
    setActiveTab("form");
  }, [ocrDetail]);

  if (!ocrDetail) {
    return (
      <div className="emptyState compact">
        <strong>詳細データはまだありません</strong>
        <span>下書き作成後、抽出項目・JSON・CSVをここで確認できます。</span>
      </div>
    );
  }

  function updateField(index: number, value: string) {
    setFields((current) =>
      current.map((field, fieldIndex) =>
        fieldIndex === index
          ? {
              ...field,
              value,
              needsReview: false,
              confidence: Math.max(field.confidence, 90)
            }
          : field
      )
    );
  }

  function objectData() {
    return Object.fromEntries(fields.map((field) => [field.key, field.value]));
  }

  function csvData() {
    const escapeCsv = (value: string) =>
      `"${String(value).replaceAll('"', '""')}"`;

    return [
      ["key", "項目名", "値", "信頼度", "要確認"],
      ...fields.map((field) => [
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

  return (
    <div className="detailPanel no-print">
      <div className="resultSummary">
        <div>
          <span>判定された内容</span>
          <strong>{ocrDetail.documentType}</strong>
        </div>
        <p>{ocrDetail.summary}</p>
      </div>

      <div className="tabs" role="tablist">
        {(["form", "json", "csv"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "form" ? "フォーム" : tab === "json" ? "JSON" : "CSV"}
          </button>
        ))}
      </div>

      {activeTab === "form" && (
        <div className="fieldList">
          {fields.map((field, index) => (
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

      {ocrDetail.warnings.length > 0 && (
        <div className="warningBox">
          <strong>確認事項</strong>
          <ul>
            {ocrDetail.warnings.map((warning, index) => (
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
