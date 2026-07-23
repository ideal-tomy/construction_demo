# construction_demo — 建設の記録デモ（3体験）

ideal TOP「建設」から飛ぶ **外部ハブ**（製造の `product_flow` `/manufacturing` と同型）。

| ルート | 体験 |
|--------|------|
| `/` | ハブ（①②③の入口） |
| `/photo` | ① 写真の仕事化（分類・命名） |
| `/report` | ② 報告書・朝礼下書き |
| （外部） | ③ [kanri 現場オペ](https://kanri-kensetsu.vercel.app/login) |

リポジトリ: https://github.com/ideal-tomy/construction_demo  
本番: https://construction-demo-two.vercel.app

## セットアップ

```bash
cd construction_demo
npm install
cp .env.example .env.local
```

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-nano
NEXT_PUBLIC_ROI_SIMULATOR_URL=https://roi-simulator-eta.vercel.app
# 任意
# NEXT_PUBLIC_CONTACT_URL=https://…/contact
```

```bash
npm run dev
```

## 関連

- ideal PLAN: `sites/ideal_official/docs/industry-demos/construction.md`
- UX原則: `sites/ideal_official/docs/industry-demos/ux-saas-principles.md` §4.2
