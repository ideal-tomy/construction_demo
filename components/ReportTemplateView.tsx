"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReportDraft, ReportHeader, ReportSections } from "@/lib/types";

type Props = {
  draft: ReportDraft;
  revealCount: number;
  editable: boolean;
  compact?: boolean;
  onHeaderChange: (key: keyof ReportHeader, value: string) => void;
  onSectionChange: (key: keyof ReportSections, value: string) => void;
  onClearReview: (path: string) => void;
};

const HEADER_FIELDS: { key: keyof ReportHeader; label: string }[] = [
  { key: "projectName", label: "案件名" },
  { key: "siteName", label: "現場名" },
  { key: "date", label: "日付" },
  { key: "reporter", label: "報告者" },
  { key: "weather", label: "天候" }
];

const SECTION_FIELDS: { key: keyof ReportSections; label: string }[] = [
  { key: "workSummary", label: "本日の作業内容" },
  { key: "progress", label: "進捗・完了状況" },
  { key: "materials", label: "使用資材・機材" },
  { key: "safety", label: "安全・ヒヤリハット" },
  { key: "photoFindings", label: "写真所見" },
  { key: "nextPlan", label: "翌日予定" },
  { key: "requests", label: "要請事項" }
];

export function ReportTemplateView({
  draft,
  revealCount,
  editable,
  compact,
  onHeaderChange,
  onSectionChange,
  onClearReview
}: Props) {
  const needsReview = (path: string) =>
    draft.reviewFields.some((field) => field.path === path);

  const reviewReason = (path: string) =>
    draft.reviewFields.find((field) => field.path === path)?.reason;

  const defaultOpen = useMemo(() => {
    // スマホは縦を抑えるため、要確認がある欄だけ開く（PCは作業・安全を初期表示）
    const open = new Set<string>(compact ? [] : ["workSummary", "safety"]);
    draft.reviewFields.forEach((field) => {
      if (field.path.startsWith("sections.")) {
        open.add(field.path.replace("sections.", ""));
      }
    });
    return open;
  }, [compact, draft.reviewFields]);

  const [openSections, setOpenSections] = useState<Set<string>>(defaultOpen);

  useEffect(() => {
    setOpenSections(defaultOpen);
  }, [defaultOpen]);

  function toggleSection(key: string) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  let visibleIndex = 0;

  return (
    <article
      className={`docTemplate reportTemplate print-target ${
        compact ? "docCompact" : ""
      }`}
    >
      <header className="docHeader">
        <p className="docEyebrow">SITE DAILY REPORT</p>
        <h3>{draft.title}</h3>
        <p className="docSub">
          {draft.reviewFields.length > 0
            ? `AI下書き / 要確認 ${draft.reviewFields.length} 件`
            : "写真添付済みテンプレート（AI下書き前）"}
        </p>
      </header>

      {draft.sourceImages.length > 0 ? (
        <section className="docPhotoSheet" aria-label="添付写真">
          <div className="docPhotoSheetHead">
            <strong>添付写真</strong>
            <span>{draft.sourceImages.length} 枚</span>
          </div>
          <div className="docPhotoSheetGrid">
            {draft.sourceImages.map((image, index) => (
              <figure key={`${image.name}-${index}`} className="docPhotoCell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.previewUrl} alt={image.name} />
                <figcaption>
                  <em>写真{index + 1}</em>
                  <span>{image.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="docGrid">
        {HEADER_FIELDS.map((field) => {
          const index = visibleIndex++;
          const path = `header.${field.key}`;
          const revealed = revealCount > index;
          const review = needsReview(path);
          const value = draft.header[field.key];
          return (
            <label
              key={field.key}
              className={`docField ${review ? "needsReview" : ""} ${
                revealed ? "revealed" : "pending"
              }`}
            >
              <span>
                {field.label}
                {review && <em>要確認</em>}
              </span>
              {editable ? (
                <input
                  value={value}
                  placeholder="未記入"
                  onChange={(event) => {
                    onHeaderChange(field.key, event.target.value);
                    if (review) onClearReview(path);
                  }}
                />
              ) : (
                <strong>
                  {revealed ? value || "未記入" : "…"}
                </strong>
              )}
              {review && revealed && <small>{reviewReason(path)}</small>}
            </label>
          );
        })}
      </section>

      <div className="docSections">
        {SECTION_FIELDS.map((field) => {
          const index = visibleIndex++;
          const path = `sections.${field.key}`;
          const revealed = revealCount > index;
          const review = needsReview(path);
          const isOpen = !compact || openSections.has(field.key);
          const value = draft.sections[field.key];
          const preview = value.slice(0, 42);

          return (
            <div
              key={field.key}
              className={`docBlockWrap ${review ? "needsReview" : ""} ${
                revealed ? "revealed" : "pending"
              }`}
            >
              {compact ? (
                <button
                  type="button"
                  className="docAccordionBtn no-print"
                  onClick={() => toggleSection(field.key)}
                  aria-expanded={isOpen}
                >
                  <span>
                    {field.label}
                    {review && <em>要確認</em>}
                  </span>
                  <strong>{isOpen ? "−" : "+"}</strong>
                </button>
              ) : null}

              {compact && !isOpen && (
                <p className="docCollapsedPreview no-print">
                  {revealed
                    ? preview
                      ? `${preview}${preview.length >= 36 ? "…" : ""}`
                      : "未記入"
                    : "記入中…"}
                </p>
              )}

              <label
                className={`docBlock ${compact ? "docBlockOpen" : ""} ${
                  compact && !isOpen ? "isCollapsed" : ""
                } ${review ? "needsReview" : ""}`}
              >
                {!compact && (
                  <span>
                    {field.label}
                    {review && <em>要確認</em>}
                  </span>
                )}
                {editable ? (
                  <textarea
                    rows={compact ? 2 : 3}
                    value={value}
                    placeholder="未記入"
                    onChange={(event) => {
                      onSectionChange(field.key, event.target.value);
                      if (review) onClearReview(path);
                    }}
                  />
                ) : (
                  <p>{revealed ? value || "未記入" : "記入中…"}</p>
                )}
                {review && revealed && <small>{reviewReason(path)}</small>}
              </label>
            </div>
          );
        })}
      </div>
    </article>
  );
}
