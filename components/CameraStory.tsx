"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CAMERA_STORY_SCENES,
  CAMERA_STORY_STATIC_CAM,
  cameraStoryCopy,
  cameraStoryPhotoSrc,
  type Cam,
  type StoryEl,
} from "@/lib/cameraStory";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CameraStory() {
  const viewRef = useRef<HTMLButtonElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<HTMLDivElement>(null);
  const phRef = useRef<HTMLDivElement>(null);
  const pcRef = useRef<HTMLDivElement>(null);
  const f1Ref = useRef<HTMLDivElement>(null);
  const f2Ref = useRef<HTMLDivElement>(null);

  const elMap = useCallback((): Record<StoryEl, HTMLElement | null> => {
    return {
      set: setRef.current,
      tl: tlRef.current,
      ph: phRef.current,
      pc: pcRef.current,
      f1: f1Ref.current,
      f2: f2Ref.current,
    };
  }, []);

  const baseClass = useRef<Partial<Record<StoryEl, string>>>({});
  const atRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const subsRef = useRef<number[]>([]);
  const runningRef = useRef(false);
  const stepRef = useRef<() => void>(() => {});

  const [caption, setCaption] = useState(CAMERA_STORY_SCENES[0].text);
  const [dotIndex, setDotIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  const camTo = useCallback((c: Cam) => {
    const view = viewRef.current;
    const setEl = setRef.current;
    if (!view || !setEl) return;
    const vw = view.clientWidth;
    const vh = view.clientHeight;
    const x = vw / 2 - c[0] * c[2];
    const y = vh / 2 - c[1] * c[2];
    setEl.style.transform = `translate(${x}px, ${y}px) scale(${c[2]})`;
  }, []);

  const resetAll = useCallback(() => {
    const els = elMap();
    (Object.keys(els) as StoryEl[]).forEach((k) => {
      const el = els[k];
      const base = baseClass.current[k];
      if (el && base !== undefined) el.className = base;
    });
  }, [elMap]);

  const clearSubs = useCallback(() => {
    subsRef.current.forEach((id) => window.clearTimeout(id));
    subsRef.current = [];
  }, []);

  const play = useCallback(
    (i: number) => {
      const s = CAMERA_STORY_SCENES[i];
      if (i === 0) resetAll();
      camTo(s.cam);
      clearSubs();
      const els = elMap();
      s.do.forEach(([delay, elKey, phase]) => {
        const id = window.setTimeout(() => {
          els[elKey]?.classList.add(phase);
        }, delay);
        subsRef.current.push(id);
      });
      if (s.text) setCaption(s.text);
      else setCaption("");
      setDotIndex(i);
    },
    [camTo, clearSubs, elMap, resetAll]
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
      const el = els[k];
      if (el) baseClass.current[k] = el.className;
    });

    if (prefersReducedMotion()) {
      setReduced(true);
      setCaption(cameraStoryCopy.reducedCaption);
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
      window.removeEventListener("resize", onResize);
    };
  }, [camTo, elMap, start, stop]);

  const onToggle = () => {
    if (reduced) return;
    if (runningRef.current) stop();
    else start();
  };

  return (
    <div className="camStory">
      <button
        type="button"
        className="camStoryView"
        ref={viewRef}
        onClick={onToggle}
        aria-label={
          reduced
            ? "現場から責任者への流れ"
            : paused
              ? "説明を再生する"
              : "説明を一時停止する"
        }
      >
        <div className="camStorySet" ref={setRef}>
          <div className="camStoryDev camStoryPhone" ref={phRef}>
            <div className="camStoryBar">
              <b>現場</b>スマホ
            </div>
            <div className="camStoryPic">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cameraStoryPhotoSrc} alt="" />
            </div>
            <div className="camStoryNmline">
              <b className="camStoryNmOld">{cameraStoryCopy.phoneOldName}</b>
              <b className="camStoryNmNew">{cameraStoryCopy.phoneNewName}</b>
            </div>
            <div className="camStoryBtn">{cameraStoryCopy.sendLabel}</div>
            <div className="camStoryNudgeToast" aria-hidden>
              撮り直し依頼
            </div>
          </div>

          <div className="camStoryDev camStoryPc" ref={pcRef}>
            <div className="camStoryBar">
              <b>{cameraStoryCopy.pcBar}</b>
              {cameraStoryCopy.pcBarSub}
            </div>
            <div className="camStoryPcBody">
              <div className="camStoryNotify">
                <span className="camStoryNotifyDot" />
                <div>
                  <strong>{cameraStoryCopy.notifyTitle}</strong>
                  <em>{cameraStoryCopy.notifyMeta}</em>
                </div>
              </div>
              <div className="camStoryMissing">
                <strong>{cameraStoryCopy.missingLabel}</strong>
                <p>{cameraStoryCopy.missingReason}</p>
              </div>
              <div className="camStoryPcActions">
                <span className="camStoryBtn camStoryConfirm">
                  {cameraStoryCopy.confirmLabel}
                </span>
                <span className="camStoryBtn camStoryNudge">
                  {cameraStoryCopy.nudgeLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="camStoryFly camStoryFlyReport" ref={f1Ref}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="camStoryFlyImg"
              src={cameraStoryPhotoSrc}
              alt=""
            />
            <div className="camStoryFlyDoc" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="camStoryFly camStoryFlyNudge" ref={f2Ref}>
            催促
          </div>
        </div>

        <div className="camStoryTl" ref={tlRef}>
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
      </button>

      <div className="camStoryDots" aria-hidden>
        {CAMERA_STORY_SCENES.map((_, i) => (
          <span
            key={i}
            className={`camStoryDot${i === dotIndex ? " isOn" : ""}`}
          />
        ))}
      </div>
      <p className="camStoryCap">{caption}</p>
      {!reduced ? (
        <p className="camStoryNote">{cameraStoryCopy.note}</p>
      ) : null}
    </div>
  );
}
