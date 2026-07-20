"use client";

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
  onMetaChange,
  onListChange,
  onClearReview
}: Props) {
  const needsReview = (path: string) =>
    draft.reviewFields.some((field) => field.path === path);

  const reviewReason = (path: string) =>
    draft.reviewFields.find((field) => field.path === path)?.reason;

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
    return (
      <label
        className={`docBlock ${review ? "needsReview" : ""} ${
          revealed ? "revealed" : "pending"
        }`}
      >
        <span>
          {label}
          {review && <em>要確認</em>}
        </span>
        {editable ? (
          multiline ? (
            <textarea
              rows={3}
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
    );
  }

  return (
    <article className="docTemplate toolboxTemplate print-target">
      <header className="docHeader">
        <p className="docEyebrow">MORNING BRIEFING</p>
        <h3>{draft.title}</h3>
        <p className="docSub">
          {draft.siteName} / {draft.date} / 要確認 {draft.reviewFields.length}{" "}
          件
        </p>
      </header>

      <div className="docSections">
        {renderMeta("title", "タイトル", "title")}
        {renderMeta("siteName", "現場名", "siteName")}
        {renderMeta("date", "日付", "date")}
        {renderMeta("summary", "今日の現場サマリ", "summary", true)}

        {LIST_BLOCKS.map((block) => {
          const index = visibleIndex++;
          const revealed = revealCount > index;
          const review = needsReview(block.key);
          const text = draft[block.key].join("\n");
          return (
            <label
              key={block.key}
              className={`docBlock ${block.emphasize ? "emphasize" : ""} ${
                review ? "needsReview" : ""
              } ${revealed ? "revealed" : "pending"}`}
            >
              <span>
                {block.label}
                {review && <em>要確認</em>}
              </span>
              {editable ? (
                <textarea
                  rows={block.key === "talkScripts" ? 5 : 4}
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
              {review && revealed && <small>{reviewReason(block.key)}</small>}
            </label>
          );
        })}
      </div>
    </article>
  );
}
