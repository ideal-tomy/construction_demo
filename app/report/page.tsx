"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatArrivalToast } from "@/components/ChatArrivalToast";
import { DetailDataPanel } from "@/components/DetailDataPanel";
import { ModeSelector } from "@/components/ModeSelector";
import { MultiImageUploader } from "@/components/MultiImageUploader";
import { ProcessStepper } from "@/components/ProcessStepper";
import { ReportPrintView } from "@/components/ReportPrintView";
import { ReportTemplateView } from "@/components/ReportTemplateView";
import { RoiPaybackCta } from "@/components/RoiPaybackCta";
import { SampleLauncher } from "@/components/SampleLauncher";
import { ToolboxTemplateView } from "@/components/ToolboxTemplateView";
import { WorkflowActions } from "@/components/WorkflowActions";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  createOpsHandoffFromDraft,
  saveOpsHandoff
} from "@/lib/opsSample";
import {
  PHOTO_FLOW_SAMPLE_ID,
  SAMPLE_SETS,
  createReportShell
} from "@/lib/samples";
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
type MobileStep = "intro" | "upload" | "result";

const REPORT_REVEAL_TOTAL = 12;
const TOOLBOX_REVEAL_TOTAL = 8;

export default function Home() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [mobileStep, setMobileStep] = useState<MobileStep>("intro");
  const [photosOpen, setPhotosOpen] = useState(false);
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
  const resultTopRef = useRef<HTMLDivElement>(null);
  const photoFlowStartedRef = useRef(false);

  const isProcessing =
    status === "receiving" || status === "reading" || status === "drafting";
  const hasUploadFiles = images.some((image) => Boolean(image.file));
  const showUploadProgress = hasUploadFiles && isProcessing;
  const canGenerate = status === "ready" || hasUploadFiles;

  const reviewCount = draft?.reviewFields.length ?? 0;
  const hasDraft =
    status === "draft" || status === "reviewed" || status === "submitted";
  const hasDocument = Boolean(draft) && (hasDraft || status === "ready");
  const showFormalReport =
    !!draft &&
    isReportDraft(draft) &&
    (status === "reviewed" || status === "submitted");
  const editable = status === "draft" || status === "ready";
  const compactDoc = isMobile;

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
            : status === "ready"
              ? "受信完了"
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

  useEffect(() => {
    if (!isMobile) return;
    if (hasDocument || isProcessing) {
      setMobileStep("result");
    }
  }, [hasDocument, isProcessing, isMobile]);

  useEffect(() => {
    if (photoFlowStartedRef.current) return;
    if (typeof window === "undefined") return;
    const from = new URLSearchParams(window.location.search).get("from");
    if (from !== "photo") return;
    photoFlowStartedRef.current = true;
    window.history.replaceState({}, "", "/report");
    preparePhotoFlow();
    // 初回マウント時のみ①からの導線を着地させる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMobile && mobileStep === "result") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isMobile, mobileStep, draft?.templateId]);

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

  function resetAll(options?: { keepStep?: MobileStep }) {
    clearTimers();
    revokeNonSample([]);
    setDraft(null);
    setStatus("idle");
    setError("");
    setRevealCount(0);
    setResultTab("document");
    setChatVisible(false);
    setElapsedLabel("約20秒");
    setPhotosOpen(false);
    if (isMobile) {
      setMobileStep(options?.keepStep ?? "upload");
    }
  }

  function handleModeChange(nextMode: DemoMode) {
    if (nextMode === mode) return;
    resetAll({ keepStep: "upload" });
    setMode(nextMode);
  }

  function animateReveal(total: number, onDone: () => void) {
    setRevealCount(0);
    for (let i = 1; i <= total; i += 1) {
      schedule(() => setRevealCount(i), 100 * i);
    }
    schedule(onDone, 100 * total + 60);
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

  function buildSampleSlots(
    sampleId: string,
    imagePaths: string[],
    imageNames?: string[]
  ): ImageSlot[] {
    return imagePaths.map((path, index) => ({
      id: `sample-${sampleId}-${index}`,
      name: imageNames?.[index] || path.split("/").pop() || `sample-${index + 1}.svg`,
      previewUrl: path,
      fromSample: true
    }));
  }

  /** ①→②: 写真入りの空テンプレで着地（受信完了） */
  function preparePhotoFlow() {
    const sample = SAMPLE_SETS.find((item) => item.id === PHOTO_FLOW_SAMPLE_ID);
    if (!sample || !isReportDraft(sample.draft)) return;

    clearTimers();
    setError("");
    setChatVisible(false);
    setMode("report");
    setResultTab("document");
    setElapsedLabel("約20秒");
    if (isMobile) setMobileStep("result");

    const slots = buildSampleSlots(
      sample.id,
      sample.imagePaths,
      sample.imageNames
    );
    revokeNonSample(slots);
    setPhotosOpen(true);

    const shell = createReportShell(
      sample.draft.title,
      slots.map((slot) => ({
        name: slot.name,
        previewUrl: slot.previewUrl
      }))
    );
    setDraft(shell);
    setRevealCount(REPORT_REVEAL_TOTAL);
    setStatus("ready");
  }

  /** 受信完了テンプレに、サンプル下書き本文を書き込む */
  function fillPhotoFlowDraft() {
    const sample = SAMPLE_SETS.find((item) => item.id === PHOTO_FLOW_SAMPLE_ID);
    if (!sample || !isReportDraft(sample.draft)) return;
    if (!images.length) {
      setError("反映する写真がありません。");
      setStatus("error");
      return;
    }

    clearTimers();
    setError("");
    setResultTab("document");
    setElapsedLabel("約8秒");
    if (isMobile) setMobileStep("result");

    const nextDraft = attachSourceImages(
      structuredClone(sample.draft),
      images
    );
    setDraft(nextDraft);
    setRevealCount(0);
    setStatus("drafting");
    animateReveal(REPORT_REVEAL_TOTAL, () => {
      setStatus("draft");
    });
  }

  function handleGenerate() {
    if (status === "ready") {
      fillPhotoFlowDraft();
      return;
    }
    void generateFromUpload();
  }

  async function playSample(sampleId: string) {
    if (sampleId === PHOTO_FLOW_SAMPLE_ID) {
      preparePhotoFlow();
      return;
    }

    const sample = SAMPLE_SETS.find((item) => item.id === sampleId);
    if (!sample) return;

    clearTimers();
    setError("");
    setDraft(null);
    setMode(sample.mode);
    setResultTab("document");
    setChatSender(sample.senderName);
    setChatCount(sample.imagePaths.length);
    setChatVisible(true);
    setStatus("receiving");
    setElapsedLabel("約20秒");
    if (isMobile) setMobileStep("result");

    const slots = buildSampleSlots(
      sample.id,
      sample.imagePaths,
      sample.imageNames
    );

    schedule(() => {
      revokeNonSample(slots);
    }, 350);

    schedule(() => setStatus("reading"), 700);
    schedule(() => setStatus("drafting"), 1400);

    schedule(() => {
      const nextDraft = attachSourceImages(
        structuredClone(sample.draft),
        slots
      );
      setDraft(nextDraft);
      setPhotosOpen(true);
      const total =
        sample.mode === "report" ? REPORT_REVEAL_TOTAL : TOOLBOX_REVEAL_TOTAL;
      animateReveal(total, () => {
        setStatus("draft");
        setChatVisible(false);
      });
    }, 2000);
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
    if (isMobile) setMobileStep("result");
    const started = Date.now();

    schedule(() => setStatus("drafting"), 1000);

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
      setPhotosOpen(true);
      const total =
        mode === "report" ? REPORT_REVEAL_TOTAL : TOOLBOX_REVEAL_TOTAL;
      setStatus("drafting");
      animateReveal(total, () => setStatus("draft"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "下書き作成に失敗しました。"
      );
      setStatus("error");
      if (isMobile) setMobileStep("upload");
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
    setResultTab("document");
    // 下書き編集UIの印刷を防ぐ（正式帳票表示時のみ）
    if (
      mode === "report" &&
      status !== "reviewed" &&
      status !== "submitted"
    ) {
      setStatus("reviewed");
      window.setTimeout(() => window.print(), 100);
      return;
    }
    window.setTimeout(() => window.print(), 40);
  }

  function handleSubmit() {
    if (draft && isReportDraft(draft)) {
      const sourceImages =
        draft.sourceImages.length > 0
          ? draft.sourceImages
          : images.map((slot) => ({
              name: slot.name,
              previewUrl: slot.previewUrl
            }));
      saveOpsHandoff(
        createOpsHandoffFromDraft({
          title: draft.title,
          header: draft.header,
          sections: draft.sections,
          images: sourceImages
        })
      );
    }
    setStatus("submitted");
  }

  function goToOps() {
    router.push("/ops?from=report");
  }

  const showIntro = !isMobile || mobileStep === "intro";
  const showUpload = !isMobile || mobileStep === "upload";
  const showResult = !isMobile || mobileStep === "result";
  const showDesktopChrome = !isMobile;

  const documentView = !draft ? (
    <div className="emptyState">
      <div className="emptyIcon">◎</div>
      <strong>
        {mode === "report"
          ? "報告書の下書きがここに表示されます"
          : "朝礼メモの下書きがここに表示されます"}
      </strong>
      <span>
        「サンプルで試す」を押すと、現場から写真が届く演出のあと、
        テンプレート下書きが自動作成されます。
      </span>
    </div>
  ) : showFormalReport ? (
    <ReportPrintView
      draft={draft as ReportDraft}
      statusLabel={status === "submitted" ? "提出済" : "確認済"}
    />
  ) : isReportDraft(draft) ? (
    <ReportTemplateView
      draft={draft as ReportDraft}
      revealCount={editable ? REPORT_REVEAL_TOTAL : revealCount}
      editable={editable}
      compact={compactDoc}
      onHeaderChange={updateReportHeader}
      onSectionChange={updateReportSection}
      onClearReview={clearReview}
    />
  ) : (
    <ToolboxTemplateView
      draft={draft as ToolboxBriefing}
      revealCount={
        status === "draft" || status === "reviewed" || status === "submitted"
          ? TOOLBOX_REVEAL_TOTAL
          : revealCount
      }
      editable={editable}
      compact={compactDoc}
      onMetaChange={updateToolboxMeta}
      onListChange={updateToolboxList}
      onClearReview={clearReview}
    />
  );

  return (
    <main
      className={`appMain ${isMobile ? "isMobile" : "isDesktop"}`}
      data-mobile-step={isMobile ? mobileStep : "desktop"}
    >
      <div className="demoHubBar no-print">
        <Link href="/">← ハブ</Link>
        <span>② 報告書・朝礼下書き</span>
      </div>
      <div className="shell">
        {isMobile && mobileStep !== "intro" && (
          <nav className="mobileStepNav no-print" aria-label="体験ステップ">
            <button
              type="button"
              className={mobileStep === "upload" ? "active" : ""}
              onClick={() => !isProcessing && setMobileStep("upload")}
              disabled={isProcessing}
            >
              1 入力
            </button>
            <button
              type="button"
              className={mobileStep === "result" ? "active" : ""}
              onClick={() => hasDocument && setMobileStep("result")}
              disabled={!hasDocument && !isProcessing}
            >
              2 成果物
            </button>
          </nav>
        )}

        {showIntro && (
          <section className={`introScreen no-print ${isMobile ? "mobileIntro" : ""}`}>
            <header className="hero">
              <div>
                <div className="heroTopRow">
                  <span className="eyebrow">CONSTRUCTION SITE AI</span>
                  <span className="demoBadge">体験デモ</span>
                </div>
                <h1>
                  {isMobile
                    ? "現場写真から、報告書へ。"
                    : "現場写真から、報告書と朝礼メモへ。"}
                </h1>
                <p>
                  {isMobile
                    ? "写真を置くだけで下書き完成。要確認だけ直して提出・PDF保存。"
                    : "複数の現場写真を置くだけで、内勤向けの報告書下書きや朝礼メモを自動作成します。要確認欄だけ直して、そのまま提出・PDF保存できます。"}
                </p>
              </div>
            </header>

            <aside className="notice" role="note">
              <strong>ご利用上の注意</strong>
              デモ用途では機密情報・個人情報を含む写真をアップロードしないでください。
              画像はサーバーに保存せず、解析のためにAI APIへ送信したあと破棄されます。
              サンプル再生はAPIキー不要です。
            </aside>

            <aside
              className="tipBox"
              aria-label="アップロードする写真の目安"
            >
              <strong>どんな写真をアップロードすればよいか</strong>
              <ul>
                <li>
                  <em>映っていると良いもの:</em>
                  作業本体（型枠・配筋・配管・掘削など）、進捗が分かるアングル、資材・重機、養生・安全帯・開口・誘導など。複数枚あると下書きが安定します。
                </li>
                <li>
                  <em>関係ない画像の場合:</em>
                  現場と無関係な写真（風景・料理・画面キャプチャなど）では、抽出できる情報がほぼないため、各項目が「要確認」になります。
                </li>
              </ul>
              <p>
                商談では先に「サンプルで試す」を使うと、キー不要で理想の演出を確実に見せられます。
              </p>
            </aside>

            {isMobile && (
              <div className="introCta">
                <button
                  type="button"
                  className="primaryButton introCtaButton"
                  onClick={() => setMobileStep("upload")}
                >
                  体験をはじめる
                </button>
                <p>サンプルならAPIキー不要・約20秒</p>
              </div>
            )}
          </section>
        )}

        {showUpload && (
          <section className={`uploadScreen ${isMobile ? "mobileUpload" : ""}`}>
            {showDesktopChrome && (
              <>
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
              </>
            )}

            {isMobile && (
              <>
                <ModeSelector
                  mode={mode}
                  disabled={isProcessing}
                  onChange={handleModeChange}
                />
                <ChatArrivalToast
                  visible={chatVisible && mobileStep === "upload"}
                  senderName={chatSender}
                  photoCount={chatCount}
                  onDismiss={() => setChatVisible(false)}
                />
              </>
            )}

            <div className={`workspace ${isMobile ? "mobileWorkspace" : ""}`}>
              <div className={`leftColumn no-print ${isMobile ? "mobilePane" : ""}`}>
                <div className="panelHeader">
                  <div>
                    <h2>現場写真</h2>
                    <p>
                      {mode === "report"
                        ? "最大5枚・サンプル推奨"
                        : "1〜3枚・サンプル推奨"}
                    </p>
                  </div>
                  {!isMobile && images.length > 0 && (
                    <button
                      className="textButton"
                      type="button"
                      onClick={() => resetAll()}
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

                <div className="dividerLabel">または自分の写真</div>

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
                  showBeforeAfter={!isMobile && hasDraft}
                  elapsedLabel={elapsedLabel}
                  showProgress={showUploadProgress}
                />

                {!isMobile && (
                  <WorkflowActions
                    status={status}
                    reviewCount={reviewCount}
                    canGenerate={canGenerate}
                    isProcessing={isProcessing}
                    onGenerate={handleGenerate}
                    onReview={() => setStatus("reviewed")}
                    onSubmit={handleSubmit}
                    onPrint={handlePrint}
                    onReset={() => resetAll()}
                    onBackToDraft={() => setStatus("draft")}
                    onGoOps={goToOps}
                  />
                )}

                {isMobile && (
                  <div className="mobileUploadActions">
                    <button
                      type="button"
                      className="primaryButton mobileFullBtn"
                      disabled={!canGenerate || isProcessing}
                      onClick={handleGenerate}
                    >
                      {isProcessing
                        ? "作成中…"
                        : status === "ready"
                          ? "AIで下書き"
                          : "AIで下書き作成"}
                    </button>
                    {status === "ready" ? (
                      <p className="mobileHint">
                        写真は反映済み。AIで日付・現場名などを記入します
                      </p>
                    ) : hasUploadFiles ? (
                      <p className="mobileHint">
                        写真を選んだら上のボタンをタップ
                      </p>
                    ) : (
                      <p className="mobileHint">
                        まずはサンプル、または写真を追加
                      </p>
                    )}
                  </div>
                )}
              </div>

              {showDesktopChrome && (
                <div className="rightColumn">
                  <div className="panelHeader no-print">
                    <div>
                      <h2>
                        {mode === "report"
                          ? "現場状況報告書"
                          : "本日の朝礼メモ"}
                      </h2>
                      <p>
                        {status === "ready"
                          ? "写真反映済み。「AIで下書き」で日付・現場名などを記入します"
                          : showFormalReport
                            ? "送付用の正式帳票です。PDF保存してクライアントへ共有できます"
                            : "テンプレート下書きを編集できます"}
                      </p>
                    </div>
                    {draft && (
                      <span className="successBadge">
                        {status === "submitted"
                          ? "提出済"
                          : status === "reviewed"
                            ? "確認済"
                            : status === "ready"
                              ? "受信完了"
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
                    documentView
                  ) : (
                    <DetailDataPanel ocrDetail={draft?.ocrDetail} />
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {showResult && isMobile && (
          <section className="resultScreen mobileResult" ref={resultTopRef}>
            <div className="no-print">
              <ChatArrivalToast
                visible={chatVisible}
                senderName={chatSender}
                photoCount={chatCount}
                onDismiss={() => setChatVisible(false)}
              />

              <div className="mobileResultHeader">
                <div>
                  <p className="mobileResultEyebrow">
                    {mode === "report" ? "現場状況報告書" : "朝礼メモ"}
                  </p>
                  <h2>
                    {status === "submitted"
                      ? "提出済"
                      : status === "reviewed"
                        ? "確認済"
                        : status === "ready"
                          ? "受信完了"
                          : isProcessing
                            ? "作成中…"
                            : "下書き"}
                  </h2>
                </div>
                {metrics && (
                  <div className="mobileMetricStrip" aria-label="概要">
                    <span>{metrics.images}枚</span>
                    <span>要確認 {metrics.review}</span>
                    <span>{elapsedLabel}</span>
                  </div>
                )}
              </div>

              <ProcessStepper
                status={status}
                error={error}
                showBeforeAfter={hasDraft}
                elapsedLabel={elapsedLabel}
                showProgress={showUploadProgress}
              />

              {images.length > 0 && (
                <div className="mobilePhotoStrip" aria-label="入力写真">
                  <div className="mobilePhotoStripHeader">
                    <strong>写真 {images.length} 枚</strong>
                    <button
                      type="button"
                      className="textButton"
                      onClick={() => setPhotosOpen((open) => !open)}
                    >
                      {photosOpen ? "小さく" : "大きく"}
                    </button>
                  </div>
                  <div
                    className={`mobilePhotoRail ${
                      photosOpen ? "isExpanded" : ""
                    }`}
                  >
                    {images.map((image, index) => (
                      <figure key={image.id} className="mobilePhotoItem">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.previewUrl} alt={image.name} />
                        <figcaption>{index + 1}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              )}

              <div className="tabs" role="tablist">
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
                  詳細
                </button>
              </div>
            </div>

            <div className="mobileDocScroll">
              {resultTab === "document" ? (
                documentView
              ) : (
                <div className="no-print">
                  <DetailDataPanel ocrDetail={draft?.ocrDetail} />
                </div>
              )}
            </div>

            {status === "submitted" && (
              <div className="no-print">
                <p className="submitMessage mobileSubmitMsg">
                  提出完了。転記なしで、このまま共有できます。
                </p>
                <button
                  type="button"
                  className="primaryButton mobileFullBtn"
                  onClick={goToOps}
                >
                  ③ 管理画面で確認 →
                </button>
                <RoiPaybackCta />
              </div>
            )}

            <div className="mobileStickySpacer no-print" aria-hidden />
          </section>
        )}

        {isMobile && mobileStep === "result" && (
          <WorkflowActions
            status={
              hasDraft || isProcessing || status === "ready" ? status : "idle"
            }
            reviewCount={reviewCount}
            canGenerate={canGenerate}
            isProcessing={isProcessing}
            sticky
            onGenerate={handleGenerate}
            onReview={() => setStatus("reviewed")}
            onSubmit={handleSubmit}
            onPrint={handlePrint}
            onReset={() => resetAll({ keepStep: "upload" })}
            onBack={() => setMobileStep("upload")}
            onBackToDraft={() => setStatus("draft")}
            onGoOps={goToOps}
          />
        )}

        {showDesktopChrome && (
          <footer className="no-print">
            <span>
              アップロード画像はサーバーに保存されず、解析のためAI
              APIへ送信されます。
            </span>
            <span>
              PDF保存は印刷ダイアログから「PDFに保存」を選んでください。
            </span>
          </footer>
        )}
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
