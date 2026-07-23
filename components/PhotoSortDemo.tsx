"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  constructionPhotoSample,
  processingSteps,
} from "@/lib/photoSample";

export function PhotoSortDemo() {
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);

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

  const { photos, results, folders } = constructionPhotoSample;

  return (
    <div className="photoRoot">
      <header className="photoHeader">
        <Link href="/" className="photoBack">
          ← ハブ
        </Link>
        <p className="photoStep">① 写真の仕事化</p>
        <h1 className="photoTitle">散在写真 → 分類・命名</h1>
        <p className="photoLead">
          サンプル写真です。実ファイルのアップロードは不要です。
        </p>
      </header>

      <section className="photoPanel">
        <h2 className="photoPanelTitle">Before · IMGの山</h2>
        <ul className="photoGrid">
          {photos.map((p) => (
            <li
              key={p.id}
              className="photoThumb"
              style={{ background: p.color }}
            >
              <span className="photoThumbName">{p.originalName}</span>
              <span className="photoThumbLabel">{p.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="photoActions">
        <button
          type="button"
          className="photoPrimary"
          onClick={run}
          disabled={busy}
        >
          {busy ? "整理中…" : "整理する"}
        </button>
        <button
          type="button"
          className="photoGhost"
          onClick={reset}
          disabled={busy}
        >
          リセット
        </button>
      </div>

      {logs.length > 0 ? (
        <section className="photoPanel photoLog">
          <h2 className="photoPanelTitle">処理</h2>
          <ul>
            {logs.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {done ? (
        <section className="photoPanel photoAfter">
          <h2 className="photoPanelTitle">After · 仕事の置き場</h2>
          {folders.map((folder) => (
            <div key={folder} className="photoFolder">
              <p className="photoFolderName">{folder}</p>
              <ul>
                {results
                  .filter((r) => r.folder === folder)
                  .map((r) => (
                    <li key={r.id}>
                      <strong>{r.newName}</strong>
                      <span>{r.description}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <div className="photoNext">
            <p className="photoNextLead">整えた写真が、報告書の下書きになる</p>
            <Link href="/report" className="photoPrimaryLink">
              ② 報告書下書きへ →
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
