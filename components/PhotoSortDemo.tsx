"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  constructionPhotoSample,
  processingSteps,
} from "@/lib/photoSample";

export type PhotoSortPlayback = {
  logs: string[];
  busy: boolean;
  done: boolean;
  pressed?: boolean;
};

type Props = {
  embed?: boolean;
  playback?: PhotoSortPlayback;
};

export function PhotoSortDemo({ embed = false, playback }: Props) {
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);
  const afterRef = useRef<HTMLElement>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const reset = () => {
    clearTimers();
    setLogs([]);
    setBusy(false);
    setDone(false);
  };

  const run = () => {
    clearTimers();
    setLogs([]);
    setBusy(true);
    setDone(false);
    processingSteps.forEach((step, i) => {
      const id = window.setTimeout(() => {
        setLogs((prev) => [...prev, step]);
        if (i === processingSteps.length - 1) {
          setBusy(false);
          setDone(true);
        }
      }, (i + 1) * 450);
      timers.current.push(id);
    });
  };

  useEffect(() => {
    if (!embed || !playback?.done || !afterRef.current) return;
    const scroller = afterRef.current.closest(".camStoryPhoneScale");
    if (!(scroller instanceof HTMLElement)) return;
    scroller.scrollTo({
      top: Math.max(0, afterRef.current.offsetTop - 12),
      behavior: "smooth",
    });
  }, [embed, playback?.done]);

  const shownLogs = playback?.logs ?? logs;
  const shownBusy = playback?.busy ?? busy;
  const shownDone = playback?.done ?? done;
  const { photos, results, folders } = constructionPhotoSample;

  return (
    <div className={`photoRoot${embed ? " isEmbed" : ""}`}>
      <div className="photoInner">
      <header className="photoHeader">
        {embed ? null : (
          <Link href="/" className="photoBack">
            ← ハブ
          </Link>
        )}
        <p className="photoStep">① 写真の仕事化</p>
        <h1 className="photoTitle">散在写真 → 分類・命名</h1>
        {embed ? null : (
          <p className="photoLead">
            サンプル写真です。実ファイルのアップロードは不要です。
          </p>
        )}
      </header>

      <section className="photoPanel">
        <h2 className="photoPanelTitle">Before ： ファイル名がIMGで始まる写真</h2>
        <ul className="photoGrid">
          {photos.map((p) => (
            <li key={p.id} className="photoThumb">
              <img
                src={p.src}
                alt={p.label}
                className="photoThumbImg"
                style={{ background: p.color }}
              />
              <span className="photoThumbMeta">
                <span className="photoThumbName">{p.originalName}</span>
                <span className="photoThumbLabel">{p.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="photoActions">
        <button
          type="button"
          className={`photoPrimary${playback?.pressed ? " isStoryPress" : ""}`}
          onClick={embed ? undefined : run}
          disabled={shownBusy || embed}
          tabIndex={embed ? -1 : undefined}
        >
          {shownBusy ? "整理中…" : "整理する"}
        </button>
        {embed ? null : (
          <button
            type="button"
            className="photoGhost"
            onClick={reset}
            disabled={busy}
          >
            リセット
          </button>
        )}
      </div>

      {shownLogs.length > 0 ? (
        <section className="photoPanel photoLog">
          <h2 className="photoPanelTitle">処理</h2>
          <ul>
            {shownLogs.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {shownDone ? (
        <section className="photoPanel photoAfter" ref={afterRef}>
          <h2 className="photoPanelTitle">After · 仕事の置き場</h2>
          {folders.map((folder) => (
            <div key={folder} className="photoFolder">
              <p className="photoFolderName">{folder}</p>
              <ul>
                {results
                  .filter((r) => r.folder === folder)
                  .map((r) => (
                    <li key={r.id} className="photoFolderItem">
                      <img
                        src={r.src}
                        alt={r.folder}
                        className="photoFolderImg"
                      />
                      <div className="photoFolderMeta">
                        <strong>{r.newName}</strong>
                        <span>{r.description}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          {embed ? null : (
            <div className="photoNext">
              <p className="photoNextLead">
                整えた写真を載せたまま、報告書の下書きへ進みます
              </p>
              <Link href="/report?from=photo" className="photoPrimaryLink">
                ② 報告書下書きへ →
              </Link>
            </div>
          )}
        </section>
      ) : null}
      </div>
    </div>
  );
}
