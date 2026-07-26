/** 建設デモハブ（製造の /manufacturing 相当） */

export const KANRI_OPS_URL = "https://kanri-kensetsu.vercel.app/login";

export const CONTACT_URL =
  process.env.NEXT_PUBLIC_CONTACT_URL?.trim() ||
  "https://ideal-official-three.vercel.app/contact?service=ai-consulting&intent=gallery&demo=construction-hub";

export type HubDemo = {
  id: "photo" | "report" | "ops";
  step: "①" | "②" | "③";
  title: string;
  core: string;
  href: string;
  external: boolean;
  note?: string;
  cta: string;
};

export const hubCopy = {
  title: "建設の記録デモ",
  englishLabel: "Construction",
  comboLine: "撮る → 整える → 報告・管理へ。写真が、その場で仕事になる。",
} as const;

export const hubDemos: HubDemo[] = [
  {
    id: "photo",
    step: "①",
    title: "写真の仕事化",
    core: "散在写真 → 分類・命名",
    href: "/photo",
    external: false,
    note: "サンプルで体験（実アップロード不要）。",
    cta: "写真を整える",
  },
  {
    id: "report",
    step: "②",
    title: "報告書・朝礼下書き",
    core: "写真 → 報告書／朝礼 → 確認提出",
    href: "/report",
    external: false,
    note: "整えた写真が、報告書の下書きになる。",
    cta: "下書きを出す",
  },
  {
    id: "ops",
    step: "③",
    title: "現場オペ画面",
    core: "通知確認・不足写真の催促",
    href: "/ops",
    external: false,
    note: "提出した日報が届き、内勤確認・催促まで体験できます。",
    cta: "管理画面を開く",
  },
];
