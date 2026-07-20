"use client";

import type { WorkflowStatus } from "@/lib/types";

type Props = {
  status: WorkflowStatus;
  error?: string;
  showBeforeAfter?: boolean;
  elapsedLabel?: string;
};

const STATUS_TEXT: Partial<Record<WorkflowStatus, string>> = {
  idle: "画像を選択するか、サンプルで試してください",
  receiving: "現場から写真を受信しています…",
  reading: "写真の内容を読み取っています…",
  drafting: "テンプレートに下書きを記入しています…",
  draft: "下書きが完成しました。要確認欄を見直してください",
  reviewed: "確認済みです。提出できます",
  submitted: "提出が完了しました",
  error: "エラーが発生しました"
};

const PROGRESS: Partial<Record<WorkflowStatus, number>> = {
  idle: 0,
  receiving: 15,
  reading: 45,
  drafting: 75,
  draft: 100,
  reviewed: 100,
  submitted: 100,
  error: 0
};

export function ProcessStepper({
  status,
  error,
  showBeforeAfter,
  elapsedLabel
}: Props) {
  const progress = PROGRESS[status] ?? 0;
  const text = error || STATUS_TEXT[status] || "";
  const isProcessing =
    status === "receiving" || status === "reading" || status === "drafting";

  if (status === "idle" && !error) return null;

  return (
    <div className="processStepper no-print">
      <div className={`statusBox ${status === "error" ? "error" : ""}`}>
        <div className="statusLine">
          <span>{text}</span>
          {!error && isProcessing && <strong>{progress}%</strong>}
        </div>
        {isProcessing && (
          <div className="progressTrack">
            <div className="progressBar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {showBeforeAfter &&
        (status === "draft" ||
          status === "reviewed" ||
          status === "submitted") && (
          <div className="beforeAfter">
            <div>
              <span>従来（手作業）</span>
              <strong>約15分</strong>
            </div>
            <div className="beforeAfterArrow">→</div>
            <div className="beforeAfterAi">
              <span>AI下書き</span>
              <strong>{elapsedLabel || "約20秒"}</strong>
            </div>
          </div>
        )}
    </div>
  );
}
