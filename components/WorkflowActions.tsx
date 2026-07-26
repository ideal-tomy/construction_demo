"use client";

import { useEffect, useState } from "react";
import { RoiPaybackCta } from "@/components/RoiPaybackCta";
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
  onBackToDraft?: () => void;
  onGoOps?: () => void;
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
  onBack,
  onBackToDraft,
  onGoOps
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasDraft =
    status === "draft" || status === "reviewed" || status === "submitted";
  /** 送付用PDFは正式帳票表示後のみ */
  const canPrint = status === "reviewed" || status === "submitted";

  useEffect(() => {
    setSheetOpen(false);
  }, [status]);

  const primaryLabel =
    status === "draft"
      ? `確認する${reviewCount > 0 ? `（${reviewCount}）` : ""}`
      : status === "reviewed"
        ? "提出する"
        : status === "submitted"
          ? "PDF保存"
          : isProcessing
            ? "作成中…"
            : "AIで下書き";

  function runPrimary() {
    if (status === "draft") onReview();
    else if (status === "reviewed") onSubmit();
    else if (status === "submitted") onPrint();
    else onGenerate();
  }

  // ready（①からの受信完了）または実アップロード時は AIで下書き を押せる
  const primaryDisabled = hasDraft
    ? false
    : !canGenerate || isProcessing;

  if (sticky) {
    return (
      <>
        {sheetOpen && (
          <button
            type="button"
            className="sheetBackdrop no-print"
            aria-label="操作パネルを閉じる"
            onClick={() => setSheetOpen(false)}
          />
        )}

        <div
          className={`actionSheet no-print ${sheetOpen ? "isOpen" : "isCollapsed"}`}
          role="dialog"
          aria-label="操作"
        >
          <button
            type="button"
            className="sheetHandle"
            onClick={() => setSheetOpen((open) => !open)}
            aria-expanded={sheetOpen}
          >
            <span className="sheetHandleBar" />
            <span className="sheetHandleLabel">
              {sheetOpen ? "閉じる" : "操作メニュー"}
            </span>
          </button>

          {sheetOpen && (
            <div className="sheetBody">
              <div className="workflowStatusPills" aria-label="提出ステータス">
                <span className={status === "draft" ? "active" : ""}>
                  下書き
                </span>
                <span className={status === "reviewed" ? "active" : ""}>
                  確認済
                </span>
                <span
                  className={
                    status === "submitted" ? "active success" : ""
                  }
                >
                  提出済
                </span>
              </div>

              <div className="sheetSecondaryRow">
                {onBack && (
                  <button
                    type="button"
                    className="ghostButton"
                    onClick={() => {
                      setSheetOpen(false);
                      onBack();
                    }}
                  >
                    戻る
                  </button>
                )}
                {onBackToDraft &&
                  (status === "reviewed" || status === "submitted") && (
                    <button
                      type="button"
                      className="ghostButton"
                      onClick={() => {
                        setSheetOpen(false);
                        onBackToDraft();
                      }}
                    >
                      下書きに戻る
                    </button>
                  )}
                <button
                  type="button"
                  className="ghostButton"
                  onClick={() => {
                    setSheetOpen(false);
                    onReset();
                  }}
                >
                  クリア
                </button>
                {canPrint && (
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={() => {
                      setSheetOpen(false);
                      onPrint();
                    }}
                  >
                    PDF
                  </button>
                )}
              </div>

              {status === "submitted" && (
                <>
                  <p className="submitMessage sheetSubmitMsg">
                    提出完了。転記なしで、このまま共有できます。
                  </p>
                  {onGoOps ? (
                    <button
                      type="button"
                      className="primaryButton"
                      onClick={() => {
                        setSheetOpen(false);
                        onGoOps();
                      }}
                    >
                      管理画面で確認 →
                    </button>
                  ) : null}
                  <RoiPaybackCta />
                </>
              )}
            </div>
          )}

          <div className="sheetPrimaryRow">
            <button
              type="button"
              className="primaryButton sheetPrimaryBtn"
              disabled={primaryDisabled}
              onClick={runPrimary}
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </>
    );
  }

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
            {isProcessing ? "作成中…" : "AIで下書き"}
          </button>
        )}

        {status === "draft" && (
          <>
            <button type="button" className="primaryButton" onClick={onReview}>
              確認する
              {reviewCount > 0 ? `（${reviewCount}）` : ""}
            </button>
            <p className="workflowHint">
              確認すると送付用の正式帳票になり、PDF保存できます
            </p>
          </>
        )}

        {status === "reviewed" && (
          <button type="button" className="primaryButton" onClick={onSubmit}>
            提出する
          </button>
        )}

        {canPrint && (
          <button type="button" onClick={onPrint}>
            PDFとして保存
          </button>
        )}

        {onBackToDraft &&
          (status === "reviewed" || status === "submitted") && (
            <button type="button" className="textButton" onClick={onBackToDraft}>
              下書きに戻る
            </button>
          )}

        <button type="button" className="textButton" onClick={onReset}>
          リセット
        </button>
      </div>

      {status === "submitted" && (
        <>
          <p className="submitMessage">
            提出完了。内勤が写真から手作業で転記する必要はありません。要確認欄だけ直せば、このまま共有できます。
          </p>
          {onGoOps ? (
            <button
              type="button"
              className="primaryButton"
              onClick={onGoOps}
              style={{ marginTop: 12 }}
            >
              ③ 管理画面で確認 →
            </button>
          ) : null}
          <RoiPaybackCta />
        </>
      )}
    </div>
  );
}
