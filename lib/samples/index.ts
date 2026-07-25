import { constructionPhotoSample } from "@/lib/photoSample";
import type { ReportDraft, SourceImage, ToolboxBriefing } from "@/lib/types";

export const PHOTO_FLOW_SAMPLE_ID = "report-from-photo";

/** ①→②着地用: 写真だけ入った空の日報テンプレ */
export function createReportShell(
  title: string,
  sourceImages: SourceImage[]
): ReportDraft {
  return {
    templateId: "site_daily_report_v1",
    title,
    header: {
      projectName: "",
      siteName: "",
      date: "",
      reporter: "",
      weather: ""
    },
    sections: {
      workSummary: "",
      progress: "",
      materials: "",
      safety: "",
      photoFindings: "",
      nextPlan: "",
      requests: ""
    },
    reviewFields: [],
    sourceImages
  };
}

export type SampleSet = {
  id: string;
  mode: "report" | "toolbox";
  label: string;
  senderName: string;
  imagePaths: string[];
  /** 表示用ファイル名。未指定時は path の末尾を使う */
  imageNames?: string[];
  draft: ReportDraft | ToolboxBriefing;
  /** true のとき「サンプルで試す」一覧には出さない（①→②導線専用） */
  hidden?: boolean;
};

const reportA: ReportDraft = {
  templateId: "site_daily_report_v1",
  title: "現場状況報告書（日報）",
  header: {
    projectName: "〇〇ビル新築工事",
    siteName: "本館3階 型枠工区",
    date: "2026-07-20",
    reporter: "現場太郎",
    weather: "晴れ / 気温28℃"
  },
  sections: {
    workSummary:
      "3階床スラブ型枠の組立を継続。東面パネル設置を完了し、西面は約70%まで進捗。配筋前の墨出し確認を実施。",
    progress:
      "計画比: 予定どおり。型枠組立全体進捗 約65%。明日配筋班入場予定のため、本日中に残パネルを優先。",
    materials:
      "型枠パネル（残数確認済）、セパレーター、桟木、釘・ビス。クレーン揚重は午前2回実施。",
    safety:
      "高所作業のためフルハーネス着用を徹底。開口部養生を再確認。熱中症対策として休憩・水分補給を時間管理。",
    photoFindings:
      "写真1: 東面型枠完了状況。写真2: 西面未完部分と資材置場。写真3: 開口部養生の現状。足元の資材散乱は午後に是正。",
    nextPlan:
      "西面型枠完了 → 墨出し最終確認 → 配筋班との引き継ぎ資料作成。",
    requests:
      "配筋図の最新版PDFを共有希望。午後の揚重枠を1枠追加で調整依頼。"
  },
  reviewFields: [
    {
      path: "sections.requests",
      reason: "揚重枠の追加可否は現場代理人の確認が必要"
    },
    {
      path: "header.weather",
      reason: "気温は推定値のため現地記録で確認推奨"
    }
  ],
  sourceImages: [],
  ocrDetail: {
    documentType: "現場写真セット（型枠工事）",
    summary: "型枠組立の進捗・養生・資材状況を示す現場写真群",
    fields: [
      {
        key: "work_type",
        label: "作業種別",
        value: "型枠組立",
        confidence: 96,
        needsReview: false
      },
      {
        key: "floor",
        label: "階数",
        value: "3階",
        confidence: 88,
        needsReview: false
      },
      {
        key: "progress_note",
        label: "進捗所見",
        value: "東面完了 / 西面進行中",
        confidence: 82,
        needsReview: true
      },
      {
        key: "safety_gear",
        label: "安全所見",
        value: "開口部養生あり / 高所作業",
        confidence: 79,
        needsReview: true
      }
    ],
    warnings: ["気温・揚重枠は写真から確定できないため要確認"]
  }
};

const reportB: ReportDraft = {
  templateId: "site_daily_report_v1",
  title: "現場状況報告書（日報）",
  header: {
    projectName: "市道改良工事（第2工区）",
    siteName: "配管埋設区間 B-12",
    date: "2026-07-20",
    reporter: "現場太郎",
    weather: "曇り時々晴れ"
  },
  sections: {
    workSummary:
      "雨水本管の布設を継続。掘削・据付・仮復旧までを実施。近接民家側の防音・散水を実施。",
    progress:
      "本日延長 18m 布設完了。累計進捗 62%。残土搬出は計画どおり。",
    materials:
      "ヒューム管 φ300、砕石、アスファルト合材（仮復旧用）。重機はバックホウ1台。",
    safety:
      "誘導員配置を徹底。ガス管近接区間のため試掘位置を再マーキング。",
    photoFindings:
      "写真1: 管据付状況。写真2: 埋戻し前の確認。写真3: 仮復旧完了面。管路継手部の写真は角度が浅く判読しづらい。",
    nextPlan:
      "明日は B-13 区間の掘削開始。交通規制帯の延長申請を午前中に実施。",
    requests: "ガス会社立会いの時間確定連絡を希望。"
  },
  reviewFields: [
    {
      path: "sections.photoFindings",
      reason: "継手部写真が不鮮明なため再撮影推奨"
    }
  ],
  sourceImages: [],
  ocrDetail: {
    documentType: "現場写真セット（配管埋設）",
    summary: "配管布設・埋戻し・仮復旧の現場写真群",
    fields: [
      {
        key: "work_type",
        label: "作業種別",
        value: "雨水本管布設",
        confidence: 94,
        needsReview: false
      },
      {
        key: "length",
        label: "本日延長",
        value: "約18m（推定）",
        confidence: 71,
        needsReview: true
      },
      {
        key: "equipment",
        label: "使用機材",
        value: "バックホウ",
        confidence: 90,
        needsReview: false
      }
    ],
    warnings: ["延長距離は写真からの推定値"]
  }
};

const toolboxA: ToolboxBriefing = {
  templateId: "morning_briefing_v1",
  title: "本日の朝礼メモ（下書き）",
  date: "2026-07-21",
  siteName: "本館3階 型枠工区",
  summary:
    "本日は西面型枠の完了と墨出し確認が主作業。高所・開口部・熱中症に注意して作業を開始する。",
  focusWorks: [
    "西面型枠パネル設置の完了",
    "墨出し最終確認",
    "配筋班入場前の片付け・動線確保"
  ],
  safetyPoints: [
    "フルハーネスの着用確認（始業時相互チェック）",
    "開口部養生の外れがないか朝一で巡回",
    "暑さ指数に応じた休憩・水分補給を徹底"
  ],
  cautionAreas: [
    "西面端の未養生開口",
    "クレーン揚重時の下待機禁止エリア",
    "資材置場周辺の足元"
  ],
  talkScripts: [
    "「今日は西面を仕上げます。開口部の養生、朝一で全員確認お願いします。」",
    "「揚重中は下に入らない。誘導員の合図を優先してください。」",
    "「体調が悪い人は無理せず申告を。水分は小まめに。」"
  ],
  reviewFields: [
    {
      path: "cautionAreas",
      reason: "未養生開口の位置は現地で最終確認が必要"
    }
  ],
  sourceImages: [],
  ocrDetail: {
    documentType: "朝礼用現場写真",
    summary: "高所作業・養生・資材状況から朝礼ポイントを抽出",
    fields: [
      {
        key: "main_hazard",
        label: "主要リスク",
        value: "墜落・落下 / 熱中症",
        confidence: 91,
        needsReview: false
      },
      {
        key: "focus",
        label: "重点作業",
        value: "西面型枠完了",
        confidence: 85,
        needsReview: false
      }
    ],
    warnings: []
  }
};

const toolboxB: ToolboxBriefing = {
  templateId: "morning_briefing_v1",
  title: "本日の朝礼メモ（下書き）",
  date: "2026-07-21",
  siteName: "配管埋設区間 B-13",
  summary:
    "本日は掘削開始と交通規制帯の延長が主作業。重機近接・埋設物・第三者災害防止を最優先とする。",
  focusWorks: [
    "B-13 区間の掘削開始",
    "交通規制帯の延長設置",
    "ガス管近接部の試掘確認"
  ],
  safetyPoints: [
    "誘導員を必ず配置してから重機を動かす",
    "試掘マーキング位置を作業前に全員で確認",
    "第三者（通行人）への声かけと規制材の点検"
  ],
  cautionAreas: [
    "ガス管近接区間",
    "規制帯端部（車両進入側）",
    "残土仮置場周辺"
  ],
  talkScripts: [
    "「重機を動かす前に誘導員の配置を確認します。」",
    "「ガス管付近は試掘位置を見てから掘ります。勝手に進めないでください。」",
    "「通行者への声かけを忘れず。規制材が倒れていないか随時点検を。」"
  ],
  reviewFields: [
    {
      path: "focusWorks",
      reason: "交通規制の申請完了時刻は事務所確認が必要"
    }
  ],
  sourceImages: [],
  ocrDetail: {
    documentType: "朝礼用現場写真",
    summary: "重機近接・掘削・規制状況から朝礼ポイントを抽出",
    fields: [
      {
        key: "main_hazard",
        label: "主要リスク",
        value: "重機接触 / 埋設物損傷",
        confidence: 93,
        needsReview: false
      }
    ],
    warnings: ["規制申請の確定時刻は写真から不明"]
  }
};

const reportFromPhoto: ReportDraft = {
  templateId: "site_daily_report_v1",
  title: "現場状況報告書（日報）",
  header: {
    projectName: "現場A 住宅新築工事",
    siteName: "基礎工区",
    date: "2026-08-02",
    reporter: "現場太郎",
    weather: "晴れ / 気温28℃"
  },
  sections: {
    workSummary:
      "基礎掘削の完了確認後、鉄筋配筋および型枠設置を実施。朝礼にて安全確認を行い作業を開始した。",
    progress:
      "基礎掘削完了。配筋は検査前状態まで進捗。型枠組立は完了。全体進捗は計画どおり。",
    materials:
      "異形鉄筋、型枠パネル、セパレーター、砕石。重機はバックホウ（掘削・整地）を使用。",
    safety:
      "朝礼にて全員ヘルメット・安全ベスト着用を確認。重機作業半径への立入禁止と誘導員配置を徹底。",
    photoFindings:
      "写真1: 基礎掘削完了状況。写真2: 鉄筋配筋（検査前）。写真3: 型枠組立完了。写真4: 朝礼・安全確認の記録。",
    nextPlan:
      "配筋検査立会い → コンクリート打設準備 → 打設後の養生計画の確認。",
    requests:
      "配筋検査の立会い時刻確定を希望。生コン手配数量の最終確認をお願いします。"
  },
  reviewFields: [
    {
      path: "sections.requests",
      reason: "検査立会い時刻は発注者・検査員との調整が必要"
    },
    {
      path: "header.weather",
      reason: "気温は推定値のため現地記録で確認推奨"
    }
  ],
  sourceImages: [],
  ocrDetail: {
    documentType: "現場写真セット（基礎〜型枠）",
    summary: "基礎掘削・配筋・型枠・朝礼安全確認の整理済み写真群",
    fields: [
      {
        key: "work_type",
        label: "作業種別",
        value: "基礎工事 / 鉄筋 / 型枠",
        confidence: 94,
        needsReview: false
      },
      {
        key: "safety_check",
        label: "安全確認",
        value: "朝礼実施・保護具着用確認",
        confidence: 91,
        needsReview: false
      },
      {
        key: "next_gate",
        label: "次工程ゲート",
        value: "配筋検査前",
        confidence: 86,
        needsReview: true
      }
    ],
    warnings: ["検査立会い時刻は写真から確定できないため要確認"]
  }
};

export const SAMPLE_SETS: SampleSet[] = [
  {
    id: PHOTO_FLOW_SAMPLE_ID,
    mode: "report",
    label: "写真整理からの日報",
    senderName: "現場太郎",
    imagePaths: constructionPhotoSample.results.map((r) => r.src),
    imageNames: constructionPhotoSample.results.map((r) => r.newName),
    draft: reportFromPhoto,
    hidden: true
  },
  {
    id: "report-a",
    mode: "report",
    label: "型枠工事の日報サンプル",
    senderName: "現場太郎",
    imagePaths: [
      "/samples/report-a/1.svg",
      "/samples/report-a/2.svg",
      "/samples/report-a/3.svg"
    ],
    draft: reportA
  },
  {
    id: "report-b",
    mode: "report",
    label: "配管埋設の日報サンプル",
    senderName: "現場太郎",
    imagePaths: [
      "/samples/report-b/1.svg",
      "/samples/report-b/2.svg",
      "/samples/report-b/3.svg"
    ],
    draft: reportB
  },
  {
    id: "toolbox-a",
    mode: "toolbox",
    label: "型枠現場の朝礼サンプル",
    senderName: "現場太郎",
    imagePaths: [
      "/samples/toolbox-a/1.svg",
      "/samples/toolbox-a/2.svg"
    ],
    draft: toolboxA
  },
  {
    id: "toolbox-b",
    mode: "toolbox",
    label: "配管現場の朝礼サンプル",
    senderName: "現場太郎",
    imagePaths: [
      "/samples/toolbox-b/1.svg",
      "/samples/toolbox-b/2.svg"
    ],
    draft: toolboxB
  }
];

export function getSamplesForMode(mode: "report" | "toolbox") {
  return SAMPLE_SETS.filter(
    (sample) => sample.mode === mode && !sample.hidden
  );
}
