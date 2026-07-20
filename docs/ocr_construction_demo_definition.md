# 建設向け OCR 体験デモ — Demo Definition

## 1. Demo Identity

- Demo ID: `ocr-construction-demo`
- Demo Name: 建設現場写真 → 報告書 / 朝礼メモ
- Repository: `ocr-demo-nextjs`
- Demo Type: Upload / Workflow
- Requirement File: `docs/ocr_construction_requirements.md`

## 2. Demo Goal

### 証明すること

現場から送られた複数写真を置くだけで、内勤が手作業で報告書を書かなくても、テンプレ下書きまで完成し、要確認だけ直して提出・PDF 化できる。

### 理想状態

「もう転記しなくていい」

### 最重要価値

- 導入後の想像しやすさ
- 実務感
- 分かりやすさ

## 3. Common Core Integration

**本デモはスタンドアロン継続。`@axeon/ai-demo-core` / Trial は Phase 1 では接続しない。**

- AI 接続: デモ固有 API（`/api/generate`）から OpenAI を直接呼び出し
- サンプルモード: クライアント側モック（キー不要）
- BYOK: `.env.local` の `OPENAI_API_KEY`（サーバーのみ）

## 4. Access Mode

| モード | 説明 |
|--------|------|
| Sample | 1 クリック再生。API 非呼び出し |
| Live Upload | 複数画像を `/api/generate` へ送信 |

## 5. UI / シナリオ

1. モード選択（報告書 / 朝礼）
2. サンプル再生 or 複数画像アップロード
3. 段階処理演出 → テンプレ下書き
4. 編集・要確認ハイライト
5. 下書き → 確認済 → 提出済
6. PDF として保存（`window.print` + 印刷 CSS）
7. 詳細データタブで OCR 項目確認

## 6. 演出

- Loading: receiving → reading → drafting
- Before/After: 手作業約 15 分 vs AI 約 20 秒
- ChatArrival: 「現場太郎さんから写真が届きました」
- Success: 提出済 + 転記不要メッセージ

## 7. Input / Output

### Input

- Image（JPG / PNG / WebP、1 枚あたり 10MB、最大 5 枚）
- Sample Data

### Output

- ReportDraft（現場状況報告書）
- ToolboxBriefing（朝礼メモ）
- OcrResult（詳細タブ）
- Print / PDF プレビュー

## 8. 受け入れ条件

- [ ] キーなしでサンプル再生が報告書・朝礼とも最後まで通る
- [ ] 実画像（複数）で下書きが返り、編集・要確認・提出・印刷ができる
- [ ] 印刷プレビューでテンプレ本文だけが見える
- [ ] 詳細データタブで従来の項目一覧を確認できる
- [ ] 個人情報注意のノーティスを維持

## 9. Phase 2

- 音声読み上げ
- 昨日差分ハイライト
- 朝礼後チェックリスト
- Core / Trial 接続の検討
