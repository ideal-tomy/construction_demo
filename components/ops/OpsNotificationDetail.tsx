"use client";

import type { OpsNotification } from "@/lib/opsSample";

type Props = {
  item: OpsNotification;
  onClose: () => void;
  onChangeHeader: (key: "projectName" | "siteName" | "date" | "reporter" | "weather", value: string) => void;
  onChangeSection: (
    key: "workSummary" | "progress" | "requests" | "photoFindings",
    value: string
  ) => void;
  onConfirm: () => void;
};

export function OpsNotificationDetail({
  item,
  onClose,
  onChangeHeader,
  onChangeSection,
  onConfirm
}: Props) {
  return (
    <div className="opsSheetRoot" role="dialog" aria-modal="true" aria-labelledby="ops-detail-title">
      <button
        type="button"
        className="opsSheetBackdrop"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div className="opsSheet">
        <header className="opsSheetHead">
          <div>
            <p className="opsEyebrow">通知詳細</p>
            <h2 id="ops-detail-title">{item.titleDoc}</h2>
            <p className="opsSheetMeta">
              {item.sender} · {item.relativeTime}
            </p>
          </div>
          <button type="button" className="opsGhostBtn" onClick={onClose}>
            閉じる
          </button>
        </header>

        {item.images.length > 0 ? (
          <section className="opsDetailPhotos" aria-label="添付写真">
            {item.images.map((image, index) => (
              <figure key={`${image.name}-${index}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.previewUrl} alt={image.name} />
                <figcaption>写真{index + 1}</figcaption>
              </figure>
            ))}
          </section>
        ) : null}

        <section className="opsDetailForm">
          <label>
            <span>案件名</span>
            <input
              value={item.header.projectName}
              onChange={(e) => onChangeHeader("projectName", e.target.value)}
            />
          </label>
          <label>
            <span>現場名</span>
            <input
              value={item.header.siteName}
              onChange={(e) => onChangeHeader("siteName", e.target.value)}
            />
          </label>
          <label>
            <span>日付</span>
            <input
              value={item.header.date}
              onChange={(e) => onChangeHeader("date", e.target.value)}
            />
          </label>
          <label>
            <span>報告者</span>
            <input
              value={item.header.reporter}
              onChange={(e) => onChangeHeader("reporter", e.target.value)}
            />
          </label>
          <label className="opsDetailFull">
            <span>本日の作業内容</span>
            <textarea
              rows={3}
              value={item.sections.workSummary}
              onChange={(e) => onChangeSection("workSummary", e.target.value)}
            />
          </label>
          <label className="opsDetailFull">
            <span>進捗・完了状況</span>
            <textarea
              rows={2}
              value={item.sections.progress}
              onChange={(e) => onChangeSection("progress", e.target.value)}
            />
          </label>
          <label className="opsDetailFull">
            <span>要請事項</span>
            <textarea
              rows={2}
              value={item.sections.requests}
              onChange={(e) => onChangeSection("requests", e.target.value)}
            />
          </label>
        </section>

        <footer className="opsSheetFoot">
          {item.status === "reviewed" ? (
            <p className="opsConfirmedNote">確認済みです。内勤の転記作業は不要です。</p>
          ) : (
            <button type="button" className="opsPrimaryBtn" onClick={onConfirm}>
              確認済みにする
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
