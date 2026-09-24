/** ハブ用 camera-story 台本（現場 → 内勤 → 責任者） */

import { processingSteps } from "@/lib/photoSample";

export type Cam = [x: number, y: number, scale: number];

export type StoryEl = "set" | "tl" | "ph" | "office" | "mgr" | "f1" | "f2" | "f3";

export type StoryAct =
  | "reset"
  | "photoPress"
  | "photoRun"
  | "reportReceive"
  | "reportGenPress"
  | "reportDrafting"
  | "reportDone"
  | "reportConfirmPress"
  | "reportFormal"
  | "reportSubmitPress"
  | "reportSubmitted"
  | "opsArrive"
  | "opsReview"
  | "opsNudge"
  | "opsSubmitPress"
  | "opsSubmitted"
  | "dim"
  | "tlOn"
  | "tlFill";

export type StoryCssAction = [delayMs: number, el: StoryEl, phase: string];
export type StoryActAction = [delayMs: number, act: StoryAct];

export type StoryScene = {
  cam: Cam;
  ms: number;
  text: string;
  /** 厳選版 stage 表示用。画面の動きを名指しする短い1行。空なら出さない。 */
  motion: string;
  css: StoryCssAction[];
  acts: StoryActAction[];
};

export const cameraStoryCopy = {
  note: "押すと止まります。もう一度押すと動き出します。",
  reducedCaption:
    "現場は撮って送る。内勤で日報になり、責任者が承認します。",
  timelineTitle: "1件が、その日のうちに終わります。",
  timelineStops: ["16:40", "16:55", "17:10"] as const,
  timelineNames: ["現場", "内勤", "責任者"] as const,
} as const;

export const PHOTO_STORY_STEP_MS = 450;
export const PHOTO_STORY_RUN_MS = processingSteps.length * PHOTO_STORY_STEP_MS;

/**
 * 舞台幅 1100。
 * スマホ left20 top24 196×338 → 中心 118,193
 * 内勤 left250 top48 360×280 → 中心 430,188
 * 責任者 left640 top48 360×280 → 中心 820,188
 */
export const CAMERA_STORY_SCENES: StoryScene[] = [
  {
    cam: [118, 193, 0.92],
    ms: 5600,
    text: "現場で撮った写真に、名前が付きます。",
    motion: "写真に、名前が付く",
    css: [[0, "ph", "isOn"]],
    acts: [
      [0, "reset"],
      [700, "photoPress"],
      [1100, "photoRun"],
    ],
  },
  {
    cam: [280, 190, 0.58],
    ms: 5600,
    text: "写真が、内勤の報告書へ届きます。",
    motion: "写真が、報告書へ",
    css: [
      [200, "f1", "p1"],
      [400, "f1", "p2"],
      [3200, "f1", "p3"],
      [3300, "office", "isOn"],
    ],
    acts: [[3400, "reportReceive"]],
  },
  {
    cam: [430, 188, 0.9],
    ms: 6400,
    text: "ボタン一つで、日報が自動で埋まります。",
    motion: "日報が埋まる",
    css: [[0, "office", "isOn"]],
    acts: [
      [500, "reportGenPress"],
      [1100, "reportDrafting"],
      [3600, "reportDone"],
    ],
  },
  {
    cam: [430, 188, 0.9],
    ms: 5200,
    text: "もう一度押すと、送付用の報告書になります。",
    motion: "報告書になる",
    css: [[0, "office", "isOn"]],
    acts: [
      [600, "reportConfirmPress"],
      [1500, "reportFormal"],
    ],
  },
  {
    cam: [640, 188, 0.52],
    ms: 6200,
    text: "提出すると、責任者の承認へ届きます。",
    motion: "承認へ届く",
    css: [
      [0, "office", "isOn"],
      [1400, "f2", "p1"],
      [1700, "f2", "p2"],
      [4500, "f2", "p3"],
      [4600, "mgr", "isOn"],
    ],
    acts: [
      [300, "reportSubmitPress"],
      [900, "reportSubmitted"],
      [4700, "opsArrive"],
    ],
  },
  {
    cam: [820, 188, 0.88],
    ms: 5000,
    text: "責任者の画面で、過不足が一目で分かります。",
    motion: "過不足が一目で",
    css: [[0, "mgr", "isOn"]],
    acts: [[1600, "opsReview"]],
  },
  {
    cam: [640, 188, 0.52],
    ms: 5600,
    text: "足りない写真は、差し戻して撮り直せます。",
    motion: "差し戻して撮り直す",
    css: [
      [0, "mgr", "isOn"],
      [400, "f3", "p1"],
      [700, "f3", "p2"],
      [3500, "f3", "p3"],
      [3600, "ph", "isOn"],
    ],
    acts: [[200, "opsNudge"]],
  },
  {
    cam: [820, 188, 0.88],
    ms: 4200,
    text: "承認は、ボタン一つで終わります。",
    motion: "承認する",
    css: [[0, "mgr", "isOn"]],
    acts: [
      [900, "opsSubmitPress"],
      [1800, "opsSubmitted"],
    ],
  },
  {
    cam: [530, 190, 0.38],
    ms: 5200,
    text: "",
    motion: "",
    css: [],
    acts: [
      [200, "dim"],
      [400, "tlOn"],
      [1200, "tlFill"],
    ],
  },
];

export const CAMERA_STORY_STATIC_CAM: Cam = [530, 190, 0.38];
