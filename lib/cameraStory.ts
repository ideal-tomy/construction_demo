/** ハブ用 camera-story 台本（現場 → 責任者・2人） */

export type Cam = [x: number, y: number, scale: number];

export type StoryAction = [delayMs: number, el: StoryEl, phase: string];

export type StoryEl = "set" | "tl" | "ph" | "pc" | "f1" | "f2";

export type StoryScene = {
  cam: Cam;
  ms: number;
  text: string;
  do: StoryAction[];
};

export const cameraStoryCopy = {
  note: "押すと止まります。もう一度押すと動き出します。",
  reducedCaption:
    "現場は撮って送るだけ。責任者の画面には、もう日報として届きます。",
  timelineTitle: "1件が、その日のうちに終わります。",
  phoneOldName: "IMG_4832.jpg",
  phoneNewName: "0812_基礎工事_南面",
  sendLabel: "送信",
  pcBar: "責任者",
  pcBarSub: "管理画面",
  notifyTitle: "日報が届きました",
  notifyMeta: "現場A · 写真4枚",
  confirmLabel: "確認する",
  missingLabel: "配筋の接写",
  missingReason: "継手部の接写が未提出",
  nudgeLabel: "催促",
  timelineStops: ["16:40", "17:10"] as const,
  timelineNames: ["現場", "責任者"] as const,
} as const;

export const cameraStoryPhotoSrc = "/images/foundation.png";

/**
 * 舞台座標: スマホ left60 top64 96×190 → 中心 ~108,159
 * PC left340 top70 280×175 → 中心 ~480,157
 * cam は [舞台のどこを, どの高さを, どれだけ寄るか]
 */
export const CAMERA_STORY_SCENES: StoryScene[] = [
  {
    cam: [108, 158, 1.45],
    ms: 4000,
    text: "現場で撮った写真に、名前が付きます。",
    do: [
      [900, "ph", "p2"],
      [2200, "ph", "p1"],
    ],
  },
  {
    cam: [300, 160, 0.82],
    ms: 4000,
    text: "送った時点で、報告書になります。",
    do: [
      [200, "f1", "p1"],
      [500, "f1", "p2"],
      [900, "f1", "p3"],
      [1400, "pc", "p1"],
      [1400, "ph", "p3"],
    ],
  },
  {
    cam: [480, 155, 1.15],
    ms: 6000,
    text: "責任者の画面には、もう仕事として届きます。",
    do: [
      [800, "pc", "p2"],
      [2200, "pc", "p3"],
    ],
  },
  {
    cam: [480, 155, 1.15],
    ms: 6000,
    text: "足りない写真は、まだ撮り直せるうちに戻ります。",
    do: [
      [400, "pc", "p4"],
      [1600, "pc", "p5"],
      [2200, "f2", "p1"],
      [2600, "f2", "p2"],
      [3400, "ph", "p4"],
    ],
  },
  {
    cam: [300, 160, 0.82],
    ms: 6000,
    text: "",
    do: [
      [200, "set", "away"],
      [400, "tl", "p1"],
      [1200, "tl", "p2"],
    ],
  },
];

/** 減速動画時に見せる引きのカメラ */
export const CAMERA_STORY_STATIC_CAM: Cam = [300, 160, 0.82];
