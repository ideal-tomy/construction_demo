import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI OCR 帳票デジタル化デモ",
  description:
    "画像をアップロードして、帳票を構造化データへ変換するOCR体験デモ"
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
