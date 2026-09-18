"use client";

import { ProcessStepper } from "@/components/ProcessStepper";
import { ReportPrintView } from "@/components/ReportPrintView";
import { ReportTemplateView } from "@/components/ReportTemplateView";
import { createReportShell, PHOTO_FLOW_SAMPLE_ID, SAMPLE_SETS } from "@/lib/samples";
import type { ReportDraft, SourceImage, WorkflowStatus } from "@/lib/types";

export type ReportStoryPhase =
  | "idle"
  | "ready"
  | "generatePress"
  | "drafting"
  | "draft"
  | "confirmPress"
  | "formal"
  | "submitPress"
  | "submitted";

type Props = {
  phase: ReportStoryPhase;
};

const STATUS: Record<ReportStoryPhase, WorkflowStatus> = {
  idle: "idle",
  ready: "ready",
  generatePress: "ready",
  drafting: "drafting",
  draft: "draft",
  confirmPress: "draft",
  formal: "reviewed",
  submitPress: "reviewed",
  submitted: "submitted",
};

const REVEAL: Record<ReportStoryPhase, number> = {
  idle: 0,
  ready: 20,
  generatePress: 20,
  drafting: 7,
  draft: 20,
  confirmPress: 20,
  formal: 20,
  submitPress: 20,
  submitted: 20,
};

function storySample() {
  const sample = SAMPLE_SETS.find((item) => item.id === PHOTO_FLOW_SAMPLE_ID);
  if (!sample || sample.draft.templateId !== "site_daily_report_v1") {
    throw new Error("report story sample missing");
  }
  return sample;
}

function storyImages(): SourceImage[] {
  const sample = storySample();
  return sample.imagePaths.map((previewUrl, index) => ({
    previewUrl,
    name: sample.imageNames?.[index] ?? previewUrl.split("/").pop() ?? "photo.jpg",
  }));
}

function emptyDraft(): ReportDraft {
  return createReportShell(storySample().draft.title, []);
}

function filledDraft(): ReportDraft {
  return { ...storySample().draft, sourceImages: [] };
}

function printDraft(): ReportDraft {
  return { ...storySample().draft, sourceImages: storyImages() };
}

function primaryLabel(phase: ReportStoryPhase, reviewCount: number): string {
  if (phase === "submitted") return "提出済";
  if (phase === "formal" || phase === "submitPress") return "提出する";
  if (phase === "draft" || phase === "confirmPress") {
    return `確認する（${reviewCount}）`;
  }
  if (phase === "drafting") return "作成中…";
  return "AIで下書き";
}

export function ReportStoryPane({ phase }: Props) {
  const images = storyImages();
  const filled = filledDraft();
  const empty = emptyDraft();
  const status = STATUS[phase];
  const usingFilled = phase !== "idle" && phase !== "ready" && phase !== "generatePress";
  const draft = usingFilled ? filled : empty;
  const formal = phase === "formal" || phase === "submitPress" || phase === "submitted";
  const pressing =
    phase === "generatePress" || phase === "confirmPress" || phase === "submitPress";
  const reviewCount = filled.reviewFields.length;

  return (
    <div className="reportStoryRoot">
      <header className="reportStoryHead">
        <p>② 報告書・朝礼下書き</p>
        <h1>作業日報</h1>
      </header>
      {phase === "idle" ? (
        <p className="reportStoryWait">現場からの写真待ち</p>
      ) : (
        <>
          <div className="reportStoryGrid">
            <aside className="reportStoryLeft">
              <div className="reportStoryPhotos" aria-hidden>
                {images.map((image) => (
                  <figure key={image.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.previewUrl} alt="" />
                  </figure>
                ))}
              </div>
              <ProcessStepper
                status={status}
                showProgress={phase === "drafting"}
              />
            </aside>
            <div className="reportStoryDoc">
              {formal ? (
                <ReportPrintView
                  draft={printDraft()}
                  statusLabel={phase === "submitted" ? "提出済" : "確認済"}
                />
              ) : (
                <ReportTemplateView
                  draft={draft}
                  revealCount={REVEAL[phase]}
                  editable={false}
                  compact
                  onHeaderChange={() => {}}
                  onSectionChange={() => {}}
                  onClearReview={() => {}}
                />
              )}
            </div>
          </div>
          <div className="reportStoryCta">
            <div className="workflowStatusPills" aria-hidden>
              <span className={status === "draft" ? "active" : ""}>下書き</span>
              <span className={status === "reviewed" ? "active" : ""}>確認済</span>
              <span className={status === "submitted" ? "active success" : ""}>
                提出済
              </span>
            </div>
            <button
              type="button"
              className={`primaryButton opsStorySubmitBtn${
                pressing ? " isStoryPress" : ""
              }${phase === "submitted" ? " isDone" : ""}`}
              tabIndex={-1}
              disabled
            >
              {primaryLabel(phase, reviewCount)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
