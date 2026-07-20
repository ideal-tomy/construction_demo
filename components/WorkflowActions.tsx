"use client";

import type { WorkflowStatus } from "@/lib/types";

type Props = {
  status: WorkflowStatus;
  reviewCount: number;
  canGenerate: boolean;
  isProcessing: boolean;
  onGenerate: () => void;
  onReview: () => void;
  onSubmit: () => void;
  onPrint: () => void;
  onReset: () => void;
};

export function WorkflowActions({
  status,
  reviewCount,
  canGenerate,
  isProcessing,
  onGenerate,
  onReview,
  onSubmit,
  onPrint,
  onReset
}: Props) {
  const hasDraft =
    status === "draft" || status === "reviewed" || status === "submitted";

  return (
    <div className="workflowActions no-print">
      <div className="workflowStatusPills" aria-label="提出ステータス">
        <span className={status === "draft" ? "active" : ""}>下書き</span>
        <span className={status === "reviewed" ? "active" : ""}>確認済</span>
        <span className={status === "submitted" ? "active success" : ""}>
          提出済
        </span>
      </div>

      <div className="workflowButtons">
        {!hasDraft && (
          <button
            type="button"
            className="primaryButton"
            disabled={!canGenerate || isProcessing}
            onClick={onGenerate}
          >
            {isProcessing ? "作成中…" : "AIで下書き作成"}
          </button>
        )}

        {status === "draft" && (
          <button type="button" className="primaryButton" onClick={onReview}>
            確認する
            {reviewCount > 0 ? `（要確認 ${reviewCount}）` : ""}
          </button>
        )}

        {status === "reviewed" && (
          <button type="button" className="primaryButton" onClick={onSubmit}>
            提出する
          </button>
        )}

        {hasDraft && (
          <button type="button" onClick={onPrint}>
            PDFとして保存
          </button>
        )}

        <button type="button" className="textButton" onClick={onReset}>
          リセット
        </button>
      </div>

      {status === "submitted" && (
        <p className="submitMessage">
          提出完了。内勤が写真から手作業で転記する必要はありません。要確認欄だけ直せば、このまま共有できます。
        </p>
      )}
    </div>
  );
}
