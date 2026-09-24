"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { PhotoSortDemo, type PhotoSortPlayback } from "@/components/PhotoSortDemo";
import {
  ReportStoryPane,
  type ReportStoryPhase,
} from "@/components/ReportStoryPane";
import { OpsStoryPane, type OpsStoryPhase } from "@/components/ops/OpsStoryPane";
import {
  CAMERA_STORY_SCENES,
  CAMERA_STORY_STATIC_CAM,
  PHOTO_STORY_STEP_MS,
  cameraStoryCopy,
  type Cam,
  type StoryAct,
  type StoryEl,
} from "@/lib/cameraStory";
import { processingSteps } from "@/lib/photoSample";

const PHOTO_IDLE: PhotoSortPlayback = {
  logs: [],
  busy: false,
  done: false,
  pressed: false,
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CameraStory({ stage = false }: { stage?: boolean }) {
  const viewRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<HTMLDivElement>(null);
  const phRef = useRef<HTMLDivElement>(null);
  const officeRef = useRef<HTMLDivElement>(null);
  const mgrRef = useRef<HTMLDivElement>(null);
  const f1Ref = useRef<HTMLDivElement>(null);
  const f2Ref = useRef<HTMLDivElement>(null);
  const f3Ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef(stage);
  stageRef.current = stage;

  const elMap = useCallback((): Record<StoryEl, HTMLElement | null> => {
    return {
      set: setRef.current,
      tl: tlRef.current,
      ph: phRef.current,
      office: officeRef.current,
      mgr: mgrRef.current,
      f1: f1Ref.current,
      f2: f2Ref.current,
      f3: f3Ref.current,
    };
  }, []);

  const atRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const subsRef = useRef<number[]>([]);
  const photoTimers = useRef<number[]>([]);
  const runningRef = useRef(false);
  const stepRef = useRef<() => void>(() => {});

  const [caption, setCaption] = useState(CAMERA_STORY_SCENES[0].text);
  const [motion, setMotion] = useState(CAMERA_STORY_SCENES[0].motion);
  const [dotIndex, setDotIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [photo, setPhoto] = useState<PhotoSortPlayback>(PHOTO_IDLE);
  const [reportPhase, setReportPhase] = useState<ReportStoryPhase>("idle");
  const [opsPhase, setOpsPhase] = useState<OpsStoryPhase>("idle");
  const [dimmed, setDimmed] = useState(false);
  const [timeline, setTimeline] = useState<"off" | "show" | "fill">("off");

  useLayoutEffect(() => {
    if (!stage) return;
    document.documentElement.classList.add("cam-embed-stage-root");
    document.body.classList.add("cam-embed-stage-root");
    return () => {
      document.documentElement.classList.remove("cam-embed-stage-root");
      document.body.classList.remove("cam-embed-stage-root");
    };
  }, [stage]);

  const camTo = useCallback((c: Cam) => {
    const view = viewRef.current;
    const setEl = setRef.current;
    if (!view || !setEl) return;
    const vw = view.clientWidth;
    const hud = stageRef.current ? 0 : 62;
    const vh = Math.max(120, view.clientHeight - hud);
    const x = vw / 2 - c[0] * c[2];
    const y = vh / 2 - c[1] * c[2];
    setEl.style.transform = `translate(${x}px, ${y}px) scale(${c[2]})`;
  }, []);

  const resetCss = useCallback(() => {
    const els = elMap();
    (Object.keys(els) as StoryEl[]).forEach((k) => {
      els[k]?.classList.remove("isOn", "away", "p1", "p2", "p3");
    });
  }, [elMap]);

  const clearSubs = useCallback(() => {
    subsRef.current.forEach((id) => window.clearTimeout(id));
    subsRef.current = [];
  }, []);

  const clearPhotoTimers = useCallback(() => {
    photoTimers.current.forEach((id) => window.clearTimeout(id));
    photoTimers.current = [];
  }, []);

  const runAct = useCallback(
    (act: StoryAct) => {
      if (act === "reset") {
        clearPhotoTimers();
        setPhoto(PHOTO_IDLE);
        setReportPhase("idle");
        setOpsPhase("idle");
        setDimmed(false);
        setTimeline("off");
        return;
      }
      if (act === "photoPress") {
        setPhoto((prev) => ({ ...prev, pressed: true }));
        return;
      }
      if (act === "photoRun") {
        clearPhotoTimers();
        setPhoto({ logs: [], busy: true, done: false, pressed: true });
        processingSteps.forEach((step, i) => {
          const id = window.setTimeout(() => {
            const last = i === processingSteps.length - 1;
            setPhoto({
              logs: processingSteps.slice(0, i + 1).map(String),
              busy: !last,
              done: last,
              pressed: false,
            });
          }, (i + 1) * PHOTO_STORY_STEP_MS);
          photoTimers.current.push(id);
        });
        return;
      }
      if (act === "reportReceive") setReportPhase("ready");
      if (act === "reportGenPress") setReportPhase("generatePress");
      if (act === "reportDrafting") setReportPhase("drafting");
      if (act === "reportDone") setReportPhase("draft");
      if (act === "reportConfirmPress") setReportPhase("confirmPress");
      if (act === "reportFormal") setReportPhase("formal");
      if (act === "reportSubmitPress") setReportPhase("submitPress");
      if (act === "reportSubmitted") setReportPhase("submitted");
      if (act === "opsArrive") setOpsPhase("arrive");
      if (act === "opsReview") setOpsPhase("reviewed");
      if (act === "opsNudge") setOpsPhase("nudged");
      if (act === "opsSubmitPress") setOpsPhase("submitPress");
      if (act === "opsSubmitted") setOpsPhase("submitted");
      if (act === "dim") setDimmed(true);
      if (act === "tlOn") setTimeline("show");
      if (act === "tlFill") setTimeline("fill");
    },
    [clearPhotoTimers]
  );

  const play = useCallback(
    (i: number) => {
      const s = CAMERA_STORY_SCENES[i];
      resetCss();
      if (i === 0) {
        setDimmed(false);
        setTimeline("off");
      }
      camTo(s.cam);
      clearSubs();
      const els = elMap();
      s.css.forEach(([delay, elKey, phase]) => {
        const id = window.setTimeout(() => {
          els[elKey]?.classList.add(phase);
        }, delay);
        subsRef.current.push(id);
      });
      s.acts.forEach(([delay, act]) => {
        const id = window.setTimeout(() => runAct(act), delay);
        subsRef.current.push(id);
      });
      setCaption(s.text);
      setMotion(s.motion);
      setDotIndex(i);
    },
    [camTo, clearSubs, elMap, resetCss, runAct]
  );

  const stop = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    clearSubs();
    setPaused(true);
  }, [clearSubs]);

  const step = useCallback(() => {
    if (!runningRef.current) return;
    const i = atRef.current;
    play(i);
    const ms = CAMERA_STORY_SCENES[i].ms;
    atRef.current = (i + 1) % CAMERA_STORY_SCENES.length;
    timerRef.current = window.setTimeout(() => stepRef.current(), ms);
  }, [play]);

  stepRef.current = step;

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setPaused(false);
    stepRef.current();
  }, []);

  useLayoutEffect(() => {
    const els = elMap();
    (Object.keys(els) as StoryEl[]).forEach((k) => {
      els[k]?.classList.remove("isOn", "away", "p1", "p2", "p3");
    });

    if (prefersReducedMotion()) {
      setReduced(true);
      setCaption(cameraStoryCopy.reducedCaption);
      setPhoto({
        logs: processingSteps.map(String),
        busy: false,
        done: true,
        pressed: false,
      });
      setReportPhase("submitted");
      setOpsPhase("submitted");
      camTo(CAMERA_STORY_STATIC_CAM);
      return;
    }

    camTo(CAMERA_STORY_SCENES[0].cam);
    start();

    const onResize = () => {
      const last =
        (atRef.current + CAMERA_STORY_SCENES.length - 1) %
        CAMERA_STORY_SCENES.length;
      camTo(CAMERA_STORY_SCENES[last].cam);
    };
    window.addEventListener("resize", onResize);
    return () => {
      stop();
      clearPhotoTimers();
      window.removeEventListener("resize", onResize);
    };
  }, [camTo, clearPhotoTimers, elMap, start, stop]);

  const onToggle = () => {
    if (reduced) return;
    if (runningRef.current) stop();
    else start();
  };

  const playLabel = reduced
    ? "現場から責任者への流れ"
    : paused
      ? "説明を再生する"
      : "説明を一時停止する";

  return (
    <div className={`camStory${stage ? " camStoryStage" : ""}`}>
      <div className="camStoryView" ref={viewRef}>
        <div
          className={`camStorySet${dimmed ? " away" : ""}`}
          ref={setRef}
          aria-hidden
          inert
        >
          <div className="camStoryDev camStoryPhone" ref={phRef}>
            <span className="camStoryPhoneIsland" />
            <div className="camStoryPhoneStatus">
              <span>16:40</span>
              <em>現場</em>
              <span>LTE</span>
            </div>
            <div className="camStoryScreen camStoryPhoneScreen">
              <div className="camStoryPhoneScale">
                <PhotoSortDemo embed playback={photo} />
              </div>
            </div>
            <span className={`camStoryTap${photo.pressed ? " isOn" : ""}`} />
            <span className="camStoryPhoneHome" />
          </div>

          <div className="camStoryDev camStoryPc camStoryOffice" ref={officeRef}>
            <div className="camStoryBar">
              <b>内勤</b>報告書
            </div>
            <div className="camStoryScreen camStoryPcScreen">
              <div className="camStoryPcScale">
                <ReportStoryPane phase={reportPhase} />
              </div>
            </div>
          </div>

          <div className="camStoryDev camStoryPc camStoryMgr" ref={mgrRef}>
            <div className="camStoryBar">
              <b>責任者</b>承認
            </div>
            <div className="camStoryScreen camStoryPcScreen">
              <div className="camStoryPcScale">
                <OpsStoryPane phase={opsPhase} />
              </div>
            </div>
          </div>

          <div className="camStoryFly camStoryFlyReport" ref={f1Ref}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/foundation.png" alt="" />
            <span>日報</span>
          </div>
          <div className="camStoryFly camStoryFlyDoc" ref={f2Ref}>
            <i />
            <i />
            <i />
            <span>報告書</span>
          </div>
          <div className="camStoryFly camStoryFlyNudge" ref={f3Ref}>
            <i />
            <i />
            <i />
            <span>差し戻し</span>
          </div>
        </div>

        <div
          className={`camStoryTl${timeline !== "off" ? " p1" : ""}${
            timeline === "fill" ? " p2" : ""
          }`}
          ref={tlRef}
        >
          <div className="camStoryTlTitle">{cameraStoryCopy.timelineTitle}</div>
          <div className="camStoryTlTrack">
            <span className="camStoryTlFill" />
          </div>
          <div className="camStoryTlStops">
            {cameraStoryCopy.timelineStops.map((t) => (
              <i key={t}>{t}</i>
            ))}
          </div>
          <div className="camStoryTlNames">
            {cameraStoryCopy.timelineNames.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>

        {stage ? null : (
          <div className="camStoryHud">
            <div className="camStoryDots" aria-hidden>
              {CAMERA_STORY_SCENES.map((_, i) => (
                <span
                  key={i}
                  className={`camStoryDot${i === dotIndex ? " isOn" : ""}`}
                />
              ))}
            </div>
            <p className="camStoryCap">{caption || "\u00a0"}</p>
          </div>
        )}
        {stage ? null : (
          <button
            type="button"
            className="camStoryHit"
            onClick={onToggle}
            aria-label={playLabel}
          />
        )}
      </div>
      {stage
        ? motion
          ? <p className="camStoryMotion">{motion}</p>
          : null
        : !reduced
          ? <p className="camStoryHint">{cameraStoryCopy.note}</p>
          : null}
    </div>
  );
}
