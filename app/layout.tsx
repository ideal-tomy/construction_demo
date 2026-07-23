import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "建設の記録デモ（3体験）",
  description:
    "撮る→整える→報告・管理に載せる。建設現場の写真分類・報告書下書き・現場オペを体験できます。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
