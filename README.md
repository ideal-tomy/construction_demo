# AI OCR 帳票デジタル化デモ

画像をアップロードすると、OpenAI の画像認識モデルが帳票の種類と項目を判定し、編集可能な構造化データとして返す Next.js デモです。

このプロジェクトはスタンドアロン実装です。`@axeon/ai-demo-core` / Trial は使いません。

## 主な機能

- JPG / PNG / WebP 画像アップロード
- ドラッグ&ドロップ
- 帳票画像プレビュー
- AI による帳票種類の自動判定
- 項目名・値・信頼度の抽出
- 信頼度が低い項目の「要確認」表示
- 抽出値の編集
- JSON 表示・ダウンロード
- CSV 表示・ダウンロード
- API キーをブラウザに公開しないサーバー API 構成
- 10MB 上限と MIME タイプ検証
- 画像はサーバーに保存しない（解析時のみ AI API へ送信）

## セットアップ

```bash
npm install
cp .env.example .env.local
```

`.env.local` を編集します。

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4.1-mini
```

起動:

```bash
npm run dev
```

ブラウザで次を開きます。

```text
http://localhost:3000
```

本番ビルド確認:

```bash
npm run build
npm start
```

## 制限

- 対応形式は画像のみ（JPG / PNG / WebP）。PDF は対象外
- ファイルサイズ上限は 10MB
- `OPENAI_API_KEY` はサーバー側（`app/api/ocr/route.ts`）のみで利用
- デモ用途では機密情報・個人情報を含む帳票をアップロードしないでください

## 返却形式

`lib/types.ts` の `OcrResult` に準拠します。

```ts
type OcrField = {
  key: string;
  label: string;
  value: string;
  confidence: number;
  needsReview: boolean;
};

type OcrResult = {
  documentType: string;
  summary: string;
  fields: OcrField[];
  warnings: string[];
};
```

API はこれに `meta`（filename / mimeType / size）を付けて返します。
