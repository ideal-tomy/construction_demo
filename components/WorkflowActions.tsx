"use client";

import type { WorkflowStatus } from "@/lib/types";

type Props = {
  status: WorkflowStatus;
  reviewCount: number;
  canGenerate: boolean;
  isProcessing: boolean;
  sticky?: boolean;
  onGenerate: () => void;
  onReview: () => void;
  onSubmit: () => void;
  onPrint: () => void;
  onReset: () => void;
  onBack?: () => void;
};

export function WorkflowActions({
  status,
  reviewCount,
  canGenerate,
  isProcessing,
  sticky,
  onGenerate,
  onReview,
  onSubmit,
  onPrint,
  onReset,
  onBack
}: Props) {
  const hasDraft =
    status === "draft" || status === "reviewed" || status === "submitted";

  const primary =
    status === "draft" ? (
      <button type="button" className="primaryButton" onClick={onReview}>
        確認する
        {reviewCount > 0 ? `（${reviewCount}）` : ""}
      </button>
    ) : status === "reviewed" ? (
      <button type="button" className="primaryButton" onClick={onSubmit}>
        提出する
      </button>
    ) : status === "submitted" ? (
      <button type="button" className="primaryButton" onClick={onPrint}>
        PDF保存
      </button>
    ) : (
      <button
        type="button"
        className="primaryButton"
        disabled={!canGenerate || isProcessing}
        onClick={onGenerate}
      >
        {isProcessing ? "作成中…" : "AIで下書き"}
      </button>
    );

  return (
    <div
      className={`workflowActions no-print ${sticky ? "workflowSticky" : ""}`}
    >
      {!sticky && (
        <div className="workflowStatusPills" aria-label="提出ステータス">
          <span className={status === "draft" ? "active" : ""}>下書き</span>
          <span className={status === "reviewed" ? "active" : ""}>確認済</span>
          <span className={status === "submitted" ? "active success" : ""}>
            提出済
          </span>
        </div>
      )}

      <div className={`workflowButtons ${sticky ? "stickyButtons" : ""}`}>
        {sticky && onBack && (
          <button type="button" className="ghostButton" onClick={onBack}>
            戻る
          </button>
        )}

        {sticky && hasDraft && (
          <button type="button" className="ghostButton" onClick={onReset}>
            クリア
          </button>
        )}

        {sticky && hasDraft && status !== "submitted" && (
          <button type="button" className="secondaryButton" onClick={onPrint}>
            PDF
          </button>
        )}

        {sticky && primary}

        {!sticky && !hasDraft && primary}

        {!sticky && status === "draft" && primary}
        {!sticky && status === "reviewed" && primary}

        {!sticky && hasDraft && (
          <button type="button" onClick={onPrint}>
            PDFとして保存
          </button>
        )}

        {!sticky && (
          <button type="button" className="textButton" onClick={onReset}>
            リセット
          </button>
        )}
      </div>

      {status === "submitted" && !sticky && (
        <p className="submitMessage">
          提出完了。内勤が写真から手作業で転記する必要はありません。要確認欄だけ直せば、このまま共有できます。
        </p>
      )}
    </div>
  );
}
