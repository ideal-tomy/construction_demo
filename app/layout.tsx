import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "現場写真 → 報告書 / 朝礼メモ | AIデモ",
  description:
    "建設現場の写真から報告書下書きと朝礼メモを自動作成する体験デモ"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
