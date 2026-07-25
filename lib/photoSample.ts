export type SamplePhoto = {
  id: string;
  originalName: string;
  label: string;
  color: string;
  src: string;
};

export type ClassifiedPhoto = {
  id: string;
  originalName: string;
  newName: string;
  folder: string;
  description: string;
  src: string;
};

export const processingSteps = [
  "画像を読み込み中…",
  "内容を判定中…",
  "ファイル名を生成中…",
  "フォルダへ分類中…",
  "整理が完了しました",
] as const;

const photoAssets = {
  foundation: "/images/散在写真_基礎工事.png",
  rebar: "/images/散在写真_鉄筋配筋.png",
  formwork: "/images/散在写真_型枠設置.png",
  safety: "/images/散在写真_安全確認.png",
} as const;

export const constructionPhotoSample = {
  name: "建設現場サンプル",
  photos: [
    {
      id: "c1",
      originalName: "IMG_4832.jpg",
      label: "基礎工事",
      color: "#6B7280",
      src: photoAssets.foundation,
    },
    {
      id: "c2",
      originalName: "IMG_4833.jpg",
      label: "鉄筋配筋",
      color: "#78716C",
      src: photoAssets.rebar,
    },
    {
      id: "c3",
      originalName: "IMG_4834.jpg",
      label: "型枠設置",
      color: "#57534E",
      src: photoAssets.formwork,
    },
    {
      id: "c4",
      originalName: "IMG_4835.jpg",
      label: "安全確認",
      color: "#44403C",
      src: photoAssets.safety,
    },
  ] satisfies SamplePhoto[],
  results: [
    {
      id: "c1",
      originalName: "IMG_4832.jpg",
      newName: "現場A_基礎工事_2024-03-12.jpg",
      folder: "基礎工事",
      description: "基礎掘削完了の記録",
      src: photoAssets.foundation,
    },
    {
      id: "c2",
      originalName: "IMG_4833.jpg",
      newName: "現場A_鉄筋配筋_2024-03-12.jpg",
      folder: "鉄筋工事",
      description: "配筋検査前の状態",
      src: photoAssets.rebar,
    },
    {
      id: "c3",
      originalName: "IMG_4834.jpg",
      newName: "現場A_型枠設置_2024-03-13.jpg",
      folder: "型枠工事",
      description: "型枠組立完了",
      src: photoAssets.formwork,
    },
    {
      id: "c4",
      originalName: "IMG_4835.jpg",
      newName: "現場A_安全確認_2024-03-13.jpg",
      folder: "安全管理",
      description: "朝礼・安全確認の記録",
      src: photoAssets.safety,
    },
  ] satisfies ClassifiedPhoto[],
  folders: ["基礎工事", "鉄筋工事", "型枠工事", "安全管理"],
};
