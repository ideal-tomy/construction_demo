# construction_demo — 建設・本格体験デモ

ideal 建設ハブ（`/construction`）から開く **外部の本格デモ**です。  
現状の中核は「現場写真 → 報告書 / 朝礼メモ下書き」（旧 `ocr-demo-nextjs`）。

リポジトリ: https://github.com/ideal-tomy/construction_demo  
ideal ハブ: `/construction` の②

`@axeon/ai-demo-core` / Trial は使いません（詳細は `docs/`）。

## 体験モード

1. **報告書作成** … 複数写真 → 現場状況報告書テンプレ下書き → 編集 → 提出 → PDF
2. **朝礼向け解析** … 現場写真 → 朝礼メモ1枚 → 編集 → 提出 → PDF

## セットアップ

```bash
cd construction_demo
npm install
cp .env.example .env.local
```

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-5-nano
NEXT_PUBLIC_ROI_SIMULATOR_URL=https://roi-simulator-eta.vercel.app
```

本番: https://construction-demo-two.vercel.app

起動:

```bash
npm run dev
```

```text
http://localhost:3000
```

## 使い方（商談向け）

1. モードを選ぶ（報告書 / 朝礼）
2. 「サンプルで再生」または実画像アップロード
3. 要確認を直して提出 → PDF
4. 投資回収CTA（env 設定時）

## 関連

- ideal 建設 PLAN: `sites/ideal_official/docs/industry-demos/construction.md`
- UX原則（建設は別UI）: `sites/ideal_official/docs/industry-demos/ux-saas-principles.md`
- Definition: `docs/ocr_construction_demo_definition.md`
