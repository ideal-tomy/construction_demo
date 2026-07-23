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
  wedge:
    "現場で撮る・見る と、事務所に戻ってからの整理・転記・報告・管理のあいだ。",
  proof:
    "現場の記録が、退勤後の山積み作業ではなく、その場〜短時間で仕事の材料・報告・管理に載る。",
  comboLine:
    "撮る → 整える → 報告・管理に載せる。つながると「写真と記録が現場の延長で仕事になる」。",
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
    core: "記録・確認が回る業務アプリ",
    href: KANRI_OPS_URL,
    external: true,
    note: "ログイン画面が開きます。ページ内の「デモアカウント」から体験できます。",
    cta: "管理アプリを開く",
  },
];
