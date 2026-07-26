"use client";

import type { OpsMissingPhoto } from "@/lib/opsSample";

type Props = {
  item: OpsMissingPhoto;
  onClose: () => void;
  onSend: () => void;
};

export function OpsNudgeModal({ item, onClose, onSend }: Props) {
  return (
    <div className="opsSheetRoot" role="dialog" aria-modal="true" aria-labelledby="ops-nudge-title">
      <button
        type="button"
        className="opsSheetBackdrop"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div className="opsSheet opsSheetNarrow">
        <header className="opsSheetHead">
          <div>
            <p className="opsEyebrow">写真の催促</p>
            <h2 id="ops-nudge-title">{item.label}</h2>
          </div>
          <button type="button" className="opsGhostBtn" onClick={onClose}>
            閉じる
          </button>
        </header>

        <div className="opsNudgeBody">
          <p>
            <strong>宛先</strong>
            {item.assignee}（{item.siteName}）
          </p>
          <p>
            <strong>内容プレビュー</strong>
          </p>
          <blockquote>{item.nudgePreview}</blockquote>
        </div>

        <footer className="opsSheetFoot opsSheetFootRow">
          <button type="button" className="opsGhostBtn" onClick={onClose}>
            キャンセル
          </button>
          <button type="button" className="opsPrimaryBtn" onClick={onSend}>
            送信する
          </button>
        </footer>
      </div>
    </div>
  );
}
