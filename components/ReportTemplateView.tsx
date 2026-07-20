"use client";

import type { ReportDraft, ReportHeader, ReportSections } from "@/lib/types";

type Props = {
  draft: ReportDraft;
  revealCount: number;
  editable: boolean;
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
  onHeaderChange,
  onSectionChange,
  onClearReview
}: Props) {
  const needsReview = (path: string) =>
    draft.reviewFields.some((field) => field.path === path);

  const reviewReason = (path: string) =>
    draft.reviewFields.find((field) => field.path === path)?.reason;

  let visibleIndex = 0;

  return (
    <article className="docTemplate reportTemplate print-target">
      <header className="docHeader">
        <p className="docEyebrow">SITE DAILY REPORT</p>
        <h3>{draft.title}</h3>
        <p className="docSub">AI下書き / 要確認 {draft.reviewFields.length} 件</p>
      </header>

      <section className="docGrid">
        {HEADER_FIELDS.map((field) => {
          const index = visibleIndex++;
          const path = `header.${field.key}`;
          const revealed = revealCount > index;
          const review = needsReview(path);
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
                  value={draft.header[field.key]}
                  onChange={(event) => {
                    onHeaderChange(field.key, event.target.value);
                    if (review) onClearReview(path);
                  }}
                />
              ) : (
                <strong>{revealed ? draft.header[field.key] : "…"}</strong>
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
          return (
            <label
              key={field.key}
              className={`docBlock ${review ? "needsReview" : ""} ${
                revealed ? "revealed" : "pending"
              }`}
            >
              <span>
                {field.label}
                {review && <em>要確認</em>}
              </span>
              {editable ? (
                <textarea
                  rows={3}
                  value={draft.sections[field.key]}
                  onChange={(event) => {
                    onSectionChange(field.key, event.target.value);
                    if (review) onClearReview(path);
                  }}
                />
              ) : (
                <p>{revealed ? draft.sections[field.key] : "記入中…"}</p>
              )}
              {review && revealed && <small>{reviewReason(path)}</small>}
            </label>
          );
        })}
      </div>
    </article>
  );
}
