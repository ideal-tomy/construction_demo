# 現場写真 → 報告書 / 朝礼メモ デモ

建設現場の写真から、内勤向けの**報告書下書き**と**朝礼メモ**を自動作成する Next.js 体験デモです。

このプロジェクトはワークスペース直下のスタンドアロン実装です。`@axeon/ai-demo-core` / Trial は使いません（詳細は `docs/`）。

## 体験モード

1. **報告書作成** … 1日分の複数写真（最大5枚）→ 現場状況報告書テンプレ下書き → 編集 → 提出 → PDF
2. **朝礼向け解析** … 現場写真 → 朝礼メモ1枚 → 編集 → 提出 → PDF

既存の OCR 項目抽出は、結果の「詳細データ」タブで確認できます。

## 主な機能

- サンプル1クリック再生（チャット到着演出付き / APIキー不要）
- 複数画像アップロード（JPG / PNG / WebP）
- Before/After 対比（手作業約15分 vs AI約20秒）
- 要確認欄の黄色ハイライト
- 下書き → 確認済 → 提出済のステータス演出
- 印刷ダイアログ経由の「PDFとして保存」
- 詳細データ（フォーム / JSON / CSV）

## セットアップ

```bash
cd ocr-demo-nextjs
npm install
cp .env.example .env.local
```

`.env.local` を編集します（**実画像解析時のみ必須**。サンプル再生は不要）。

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_MODEL=tpt-5-nano
```

起動:

```bash
npm run dev
```

```text
http://localhost:3000
```

## 使い方（商談向け）

1. モードを選ぶ（報告書 / 朝礼）
2. **サンプルで試す** を押す（推奨・キー不要）
3. 「現場太郎さんから写真が届きました」演出のあと、下書きが埋まる
4. 要確認欄を直し、「確認する」→「提出する」
5. 「PDFとして保存」→ 印刷ダイアログで PDF 保存

自分の写真で試す場合は画像を追加して「AIで下書き作成」を押します。

## 制限

- 対応形式は画像のみ（JPG / PNG / WebP）。サンプル画像は SVG
- 1枚あたり10MB、最大5枚、合計25MB
- `OPENAI_API_KEY` はサーバー側（`app/api/generate/route.ts`）のみで利用
- デモ用途では機密情報・個人情報を含む写真をアップロードしないでください
- 画像はサーバーに保存しない（解析時のみ AI API へ送信）

## ドキュメント

- [テーマ別要件定義書](docs/ocr_construction_requirements.md)
- [Demo Definition](docs/ocr_construction_demo_definition.md)

## API

- `POST /api/generate` … `mode=report|toolbox` + `files[]`
- `POST /api/ocr` … 従来の単一帳票 OCR（互換用）

## 参考

元になった参考実装は `ocr_document_demo/docs/ocr-demo-nextjs/` にあります。実行・改修の正はこのディレクトリです。
