"use client";

import { useEffect, useMemo, useState } from "react";
import type { ToolboxBriefing } from "@/lib/types";

type ListKey =
  | "focusWorks"
  | "safetyPoints"
  | "cautionAreas"
  | "talkScripts";

type Props = {
  draft: ToolboxBriefing;
  revealCount: number;
  editable: boolean;
  compact?: boolean;
  onMetaChange: (
    key: "title" | "date" | "siteName" | "summary",
    value: string
  ) => void;
  onListChange: (key: ListKey, value: string[]) => void;
  onClearReview: (path: string) => void;
};

const LIST_BLOCKS: { key: ListKey; label: string; emphasize?: boolean }[] = [
  { key: "focusWorks", label: "本日の重点作業" },
  { key: "safetyPoints", label: "安全ポイント", emphasize: true },
  { key: "cautionAreas", label: "注意すべき箇所" },
  { key: "talkScripts", label: "声かけ例" }
];

export function ToolboxTemplateView({
  draft,
  revealCount,
  editable,
  compact,
  onMetaChange,
  onListChange,
  onClearReview
}: Props) {
  const needsReview = (path: string) =>
    draft.reviewFields.some((field) => field.path === path);

  const reviewReason = (path: string) =>
    draft.reviewFields.find((field) => field.path === path)?.reason;

  const defaultOpen = useMemo(() => {
    const open = new Set<string>(["summary", "safetyPoints"]);
    draft.reviewFields.forEach((field) => open.add(field.path));
    return open;
  }, [draft.reviewFields]);

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

  function renderMeta(
    path: string,
    label: string,
    key: "title" | "date" | "siteName" | "summary",
    multiline = false
  ) {
    const index = visibleIndex++;
    const revealed = revealCount > index;
    const review = needsReview(path);
    const isOpen = !compact || openSections.has(path) || !multiline;

    if (compact && !multiline) {
      return (
        <label
          key={path}
          className={`docField ${review ? "needsReview" : ""} ${
            revealed ? "revealed" : "pending"
          }`}
        >
          <span>
            {label}
            {review && <em>要確認</em>}
          </span>
          {editable ? (
            <input
              value={draft[key]}
              onChange={(event) => {
                onMetaChange(key, event.target.value);
                if (review) onClearReview(path);
              }}
            />
          ) : (
            <strong>{revealed ? draft[key] : "…"}</strong>
          )}
        </label>
      );
    }

    return (
      <div
        key={path}
        className={`docBlockWrap ${review ? "needsReview" : ""} ${
          revealed ? "revealed" : "pending"
        }`}
      >
        {compact && multiline ? (
          <button
            type="button"
            className="docAccordionBtn no-print"
            onClick={() => toggleSection(path)}
            aria-expanded={isOpen}
          >
            <span>
              {label}
              {review && <em>要確認</em>}
            </span>
            <strong>{isOpen ? "−" : "+"}</strong>
          </button>
        ) : null}

        {(!compact || isOpen || multiline) && (
          <label
            className={`docBlock ${review ? "needsReview" : ""} ${
              compact ? "docBlockOpen" : ""
            } ${compact && multiline && !isOpen ? "isCollapsed" : ""}`}
          >
            {!compact && (
              <span>
                {label}
                {review && <em>要確認</em>}
              </span>
            )}
            {editable ? (
              multiline ? (
                <textarea
                  rows={compact ? 2 : 3}
                  value={draft[key]}
                  onChange={(event) => {
                    onMetaChange(key, event.target.value);
                    if (review) onClearReview(path);
                  }}
                />
              ) : (
                <input
                  value={draft[key]}
                  onChange={(event) => {
                    onMetaChange(key, event.target.value);
                    if (review) onClearReview(path);
                  }}
                />
              )
            ) : (
              <p>{revealed ? draft[key] : "記入中…"}</p>
            )}
            {review && revealed && <small>{reviewReason(path)}</small>}
          </label>
        )}
      </div>
    );
  }

  return (
    <article
      className={`docTemplate toolboxTemplate print-target ${
        compact ? "docCompact" : ""
      }`}
    >
      <header className="docHeader">
        <p className="docEyebrow">MORNING BRIEFING</p>
        <h3>{draft.title}</h3>
        <p className="docSub">
          {draft.siteName} / {draft.date} / 要確認 {draft.reviewFields.length}{" "}
          件
        </p>
      </header>

      <div className={`docSections ${compact ? "docMetaGrid" : ""}`}>
        {compact ? (
          <section className="docGrid">
            {renderMeta("siteName", "現場名", "siteName")}
            {renderMeta("date", "日付", "date")}
          </section>
        ) : (
          <>
            {renderMeta("title", "タイトル", "title")}
            {renderMeta("siteName", "現場名", "siteName")}
            {renderMeta("date", "日付", "date")}
          </>
        )}

        {renderMeta("summary", "今日の現場サマリ", "summary", true)}

        {LIST_BLOCKS.map((block) => {
          const index = visibleIndex++;
          const revealed = revealCount > index;
          const review = needsReview(block.key);
          const text = draft[block.key].join("\n");
          const isOpen = !compact || openSections.has(block.key);

          return (
            <div
              key={block.key}
              className={`docBlockWrap ${block.emphasize ? "emphasize" : ""} ${
                review ? "needsReview" : ""
              } ${revealed ? "revealed" : "pending"}`}
            >
              {compact ? (
                <button
                  type="button"
                  className="docAccordionBtn no-print"
                  onClick={() => toggleSection(block.key)}
                  aria-expanded={isOpen}
                >
                  <span>
                    {block.label}
                    {review && <em>要確認</em>}
                  </span>
                  <strong>{isOpen ? "−" : "+"}</strong>
                </button>
              ) : null}

              {compact && !isOpen && (
                <p className="docCollapsedPreview no-print">
                  {revealed
                    ? draft[block.key][0] || "—"
                    : "記入中…"}
                </p>
              )}

              <label
                className={`docBlock ${block.emphasize ? "emphasize" : ""} ${
                  review ? "needsReview" : ""
                } ${compact ? "docBlockOpen" : ""} ${
                  compact && !isOpen ? "isCollapsed" : ""
                }`}
              >
                {!compact && (
                  <span>
                    {block.label}
                    {review && <em>要確認</em>}
                  </span>
                )}
                {editable ? (
                  <textarea
                    rows={compact ? 3 : block.key === "talkScripts" ? 5 : 4}
                    value={text}
                    onChange={(event) => {
                      onListChange(
                        block.key,
                        event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean)
                      );
                      if (review) onClearReview(block.key);
                    }}
                  />
                ) : revealed ? (
                  <ul>
                    {draft[block.key].map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>記入中…</p>
                )}
                {review && revealed && (
                  <small>{reviewReason(block.key)}</small>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </article>
  );
}
