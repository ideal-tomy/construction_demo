"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatArrivalToast } from "@/components/ChatArrivalToast";
import { DetailDataPanel } from "@/components/DetailDataPanel";
import { ModeSelector } from "@/components/ModeSelector";
import { MultiImageUploader } from "@/components/MultiImageUploader";
import { ProcessStepper } from "@/components/ProcessStepper";
import { ReportTemplateView } from "@/components/ReportTemplateView";
import { SampleLauncher } from "@/components/SampleLauncher";
import { ToolboxTemplateView } from "@/components/ToolboxTemplateView";
import { WorkflowActions } from "@/components/WorkflowActions";
import { SAMPLE_SETS } from "@/lib/samples";
import type {
  DemoMode,
  DraftResult,
  ImageSlot,
  ReportDraft,
  ReportHeader,
  ReportSections,
  ToolboxBriefing,
  WorkflowStatus
} from "@/lib/types";
import { isReportDraft, isToolboxBriefing } from "@/lib/types";

type ResultTab = "document" | "detail";

const REPORT_REVEAL_TOTAL = 12;
const TOOLBOX_REVEAL_TOTAL = 8;

export default function Home() {
  const [mode, setMode] = useState<DemoMode>("report");
  const [images, setImages] = useState<ImageSlot[]>([]);
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [error, setError] = useState("");
  const [revealCount, setRevealCount] = useState(0);
  const [resultTab, setResultTab] = useState<ResultTab>("document");
  const [chatVisible, setChatVisible] = useState(false);
  const [chatSender, setChatSender] = useState("現場太郎");
  const [chatCount, setChatCount] = useState(0);
  const [elapsedLabel, setElapsedLabel] = useState("約20秒");
  const timersRef = useRef<number[]>([]);

  const isProcessing =
    status === "receiving" || status === "reading" || status === "drafting";

  const reviewCount = draft?.reviewFields.length ?? 0;

  const metrics = useMemo(() => {
    if (!draft) return null;
    return {
      modeLabel: mode === "report" ? "報告書" : "朝礼メモ",
      images: draft.sourceImages.length || images.length,
      review: draft.reviewFields.length,
      statusLabel:
        status === "submitted"
          ? "提出済"
          : status === "reviewed"
            ? "確認済"
            : "下書き"
    };
  }, [draft, images.length, mode, status]);

  useEffect(() => {
    return () => {
      clearTimers();
      images.forEach((image) => {
        if (!image.fromSample) URL.revokeObjectURL(image.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }

  function revokeNonSample(nextImages: ImageSlot[]) {
    images.forEach((image) => {
      if (!image.fromSample) URL.revokeObjectURL(image.previewUrl);
    });
    setImages(nextImages);
  }

  function resetAll() {
    clearTimers();
    revokeNonSample([]);
    setDraft(null);
    setStatus("idle");
    setError("");
    setRevealCount(0);
    setResultTab("document");
    setChatVisible(false);
    setElapsedLabel("約20秒");
  }

  function handleModeChange(nextMode: DemoMode) {
    if (nextMode === mode) return;
    resetAll();
    setMode(nextMode);
  }

  function animateReveal(total: number, onDone: () => void) {
    setRevealCount(0);
    for (let i = 1; i <= total; i += 1) {
      schedule(() => setRevealCount(i), 120 * i);
    }
    schedule(onDone, 120 * total + 80);
  }

  function attachSourceImages(
    result: DraftResult,
    slots: ImageSlot[]
  ): DraftResult {
    return {
      ...result,
      sourceImages: slots.map((slot) => ({
        name: slot.name,
        previewUrl: slot.previewUrl
      }))
    };
  }

  async function playSample(sampleId: string) {
    const sample = SAMPLE_SETS.find((item) => item.id === sampleId);
    if (!sample) return;

    clearTimers();
    setError("");
    setDraft(null);
    setResultTab("document");
    setChatSender(sample.senderName);
    setChatCount(sample.imagePaths.length);
    setChatVisible(true);
    setStatus("receiving");
    setElapsedLabel("約20秒");

    const slots: ImageSlot[] = sample.imagePaths.map((path, index) => ({
      id: `sample-${sample.id}-${index}`,
      name: path.split("/").pop() || `sample-${index + 1}.svg`,
      previewUrl: path,
      fromSample: true
    }));

    schedule(() => {
      revokeNonSample(slots);
    }, 400);

    schedule(() => setStatus("reading"), 900);
    schedule(() => setStatus("drafting"), 1800);

    schedule(() => {
      const nextDraft = attachSourceImages(
        structuredClone(sample.draft),
        slots
      );
      setDraft(nextDraft);
      const total =
        sample.mode === "report" ? REPORT_REVEAL_TOTAL : TOOLBOX_REVEAL_TOTAL;
      animateReveal(total, () => {
        setStatus("draft");
        setChatVisible(false);
      });
    }, 2600);
  }

  async function generateFromUpload() {
    if (!images.length) {
      setError("解析する画像を選択してください。");
      setStatus("error");
      return;
    }

    const uploadable = images.filter((image) => image.file);
    if (!uploadable.length) {
      setError(
        "サンプル画像のまま実AI解析はできません。自分の写真を追加するか、サンプル再生を使ってください。"
      );
      setStatus("error");
      return;
    }

    clearTimers();
    setError("");
    setDraft(null);
    setResultTab("document");
    setStatus("reading");
    const started = Date.now();

    schedule(() => setStatus("drafting"), 1200);

    try {
      const formData = new FormData();
      formData.append("mode", mode);
      uploadable.forEach((image) => {
        if (image.file) formData.append("files", image.file);
      });

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "下書き作成に失敗しました。");
      }

      const seconds = Math.max(1, Math.round((Date.now() - started) / 1000));
      setElapsedLabel(`約${seconds}秒`);

      const nextDraft = attachSourceImages(data as DraftResult, images);
      setDraft(nextDraft);
      const total =
        mode === "report" ? REPORT_REVEAL_TOTAL : TOOLBOX_REVEAL_TOTAL;
      setStatus("drafting");
      animateReveal(total, () => setStatus("draft"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "下書き作成に失敗しました。"
      );
      setStatus("error");
    }
  }

  function clearReview(path: string) {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        reviewFields: current.reviewFields.filter(
          (field) => field.path !== path
        )
      };
    });
  }

  function updateReportHeader(key: keyof ReportHeader, value: string) {
    setDraft((current) => {
      if (!current || !isReportDraft(current)) return current;
      return {
        ...current,
        header: { ...current.header, [key]: value }
      };
    });
  }

  function updateReportSection(key: keyof ReportSections, value: string) {
    setDraft((current) => {
      if (!current || !isReportDraft(current)) return current;
      return {
        ...current,
        sections: { ...current.sections, [key]: value }
      };
    });
  }

  function updateToolboxMeta(
    key: "title" | "date" | "siteName" | "summary",
    value: string
  ) {
    setDraft((current) => {
      if (!current || !isToolboxBriefing(current)) return current;
      return { ...current, [key]: value };
    });
  }

  function updateToolboxList(
    key: "focusWorks" | "safetyPoints" | "cautionAreas" | "talkScripts",
    value: string[]
  ) {
    setDraft((current) => {
      if (!current || !isToolboxBriefing(current)) return current;
      return { ...current, [key]: value };
    });
  }

  function handlePrint() {
    window.print();
  }

  const editable =
    status === "draft" || status === "reviewed" || status === "submitted";

  return (
    <main>
      <div className="shell">
        <header className="hero no-print">
          <div>
            <span className="eyebrow">CONSTRUCTION SITE AI</span>
            <h1>現場写真から、報告書と朝礼メモへ。</h1>
            <p>
              複数の現場写真を置くだけで、内勤向けの報告書下書きや朝礼メモを自動作成します。
              要確認欄だけ直して、そのまま提出・PDF保存できます。
            </p>
          </div>
          <span className="demoBadge">体験デモ</span>
        </header>

        <aside className="notice no-print" role="note">
          <strong>ご利用上の注意</strong>
          デモ用途では機密情報・個人情報を含む写真をアップロードしないでください。
          画像はサーバーに保存せず、解析のためにAI APIへ送信したあと破棄されます。
          サンプル再生はAPIキー不要です。
        </aside>

        <ModeSelector
          mode={mode}
          disabled={isProcessing}
          onChange={handleModeChange}
        />

        <ChatArrivalToast
          visible={chatVisible}
          senderName={chatSender}
          photoCount={chatCount}
          onDismiss={() => setChatVisible(false)}
        />

        {metrics && (
          <section className="metrics no-print" aria-label="下書きの概要">
            <Metric label="成果物" value={metrics.modeLabel} />
            <Metric label="写真" value={`${metrics.images}枚`} />
            <Metric label="要確認" value={`${metrics.review}件`} />
            <Metric label="状態" value={metrics.statusLabel} />
          </section>
        )}

        <section className="workspace">
          <div className="leftColumn no-print">
            <div className="panelHeader">
              <div>
                <h2>現場写真</h2>
                <p>
                  {mode === "report"
                    ? "1日分の写真（最大5枚）"
                    : "朝礼用の写真（1〜3枚推奨）"}
                </p>
              </div>
              {images.length > 0 && (
                <button
                  className="textButton"
                  type="button"
                  onClick={resetAll}
                  disabled={isProcessing}
                >
                  クリア
                </button>
              )}
            </div>

            <SampleLauncher
              mode={mode}
              disabled={isProcessing}
              onSelect={playSample}
            />

            <div className="dividerLabel">または自分の写真で試す</div>

            <MultiImageUploader
              images={images}
              disabled={isProcessing}
              onChange={(next) => {
                setImages(next);
                setDraft(null);
                setStatus("idle");
                setError("");
                setRevealCount(0);
              }}
              onError={(message) => {
                setError(message);
                setStatus("error");
              }}
            />

            <ProcessStepper
              status={status}
              error={error}
              showBeforeAfter
              elapsedLabel={elapsedLabel}
            />

            <WorkflowActions
              status={status}
              reviewCount={reviewCount}
              canGenerate={images.some((image) => image.file)}
              isProcessing={isProcessing}
              onGenerate={generateFromUpload}
              onReview={() => setStatus("reviewed")}
              onSubmit={() => setStatus("submitted")}
              onPrint={handlePrint}
              onReset={resetAll}
            />
          </div>

          <div className="rightColumn">
            <div className="panelHeader no-print">
              <div>
                <h2>
                  {mode === "report" ? "現場状況報告書" : "本日の朝礼メモ"}
                </h2>
                <p>テンプレート下書きを編集できます</p>
              </div>
              {draft && (
                <span
                  className={`successBadge ${
                    status === "submitted" ? "" : ""
                  }`}
                >
                  {status === "submitted"
                    ? "提出済"
                    : status === "reviewed"
                      ? "確認済"
                      : "下書き"}
                </span>
              )}
            </div>

            <div className="tabs no-print" role="tablist">
              <button
                type="button"
                className={resultTab === "document" ? "active" : ""}
                onClick={() => setResultTab("document")}
              >
                成果物
              </button>
              <button
                type="button"
                className={resultTab === "detail" ? "active" : ""}
                onClick={() => setResultTab("detail")}
              >
                詳細データ
              </button>
            </div>

            {resultTab === "document" ? (
              !draft ? (
                <div className="emptyState">
                  <div className="emptyIcon">◎</div>
                  <strong>
                    {mode === "report"
                      ? "報告書の下書きがここに表示されます"
                      : "朝礼メモの下書きがここに表示されます"}
                  </strong>
                  <span>
                    左の「サンプルで試す」を押すと、現場から写真が届く演出のあと、
                    テンプレート下書きが自動作成されます。
                  </span>
                </div>
              ) : isReportDraft(draft) ? (
                <ReportTemplateView
                  draft={draft as ReportDraft}
                  revealCount={
                    editable ? REPORT_REVEAL_TOTAL : revealCount
                  }
                  editable={editable && status !== "drafting"}
                  onHeaderChange={updateReportHeader}
                  onSectionChange={updateReportSection}
                  onClearReview={clearReview}
                />
              ) : (
                <ToolboxTemplateView
                  draft={draft as ToolboxBriefing}
                  revealCount={
                    editable ? TOOLBOX_REVEAL_TOTAL : revealCount
                  }
                  editable={editable && status !== "drafting"}
                  onMetaChange={updateToolboxMeta}
                  onListChange={updateToolboxList}
                  onClearReview={clearReview}
                />
              )
            ) : (
              <DetailDataPanel ocrDetail={draft?.ocrDetail} />
            )}
          </div>
        </section>

        <footer className="no-print">
          <span>
            アップロード画像はサーバーに保存されず、解析のためAI
            APIへ送信されます。
          </span>
          <span>PDF保存は印刷ダイアログから「PDFに保存」を選んでください。</span>
        </footer>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
