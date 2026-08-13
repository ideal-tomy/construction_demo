# construction_demo — 建設の記録デモ（3体験）

ideal TOP「建設」から飛ぶ **外部ハブ**（製造の `product_flow` `/manufacturing` と同型）。

| ルート | 体験 |
|--------|------|
| `/` | ハブ（①②③の入口） |
| `/photo` | ① 写真の仕事化（分類・命名） |
| `/report` | ② 報告書・朝礼下書き |
| `/ops` | ③ 管理ダッシュボード（通知・確認・催促） |

補助: [GENBA 本格アプリ](https://kanri-kensetsu.vercel.app/login)（③画面内リンク）

リポジトリ: https://github.com/ideal-tomy/construction_demo  
**本番URL:** https://construction-demo-two.vercel.app

## 本番URLについて（重要）

Vercel 上のプロジェクト名は `construction-demo` です。ダッシュボードに `two` とは出ません。

公開URLが `construction-demo-two.vercel.app` なのは、`construction-demo.vercel.app` が別会社に取られているためです。`-two` はバージョン番号ではありません。

デプロイするときは **この既存プロジェクトに上書き** してください。新規プロジェクトを作ると別URLが増え、送済みのリンクが更新されません。

```bash
npx vercel --prod
```

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

## 体験の流れ

1. `/photo` で散在写真を整理
2. `/report` で日報下書き → 確認 → 提出
3. `/ops` で提出通知の確認・編集、不足写真の催促

## 静的アセット（写真デモ）

`/photo` のサンプル画像は `public/images/` 配下（`foundation.png` など）。Git に入っています。これがデプロイに含まれないと、色だけのプレースホルダになります。

- **パス・ファイル名は ASCII のみ**（日本語ファイル名は Git / URL エンコード / Vercel 配信で欠落や 404 の原因になりやすい）
- 参照元: `lib/photoSample.ts` の `photoAssets`
- 画像を差し替えるときはファイル名を変えず同名で置き換えるか、`photoAssets` とセットで更新する

## 関連

- ideal PLAN: `sites/ideal_official/docs/industry-demos/construction.md`
- UX原則: `sites/ideal_official/docs/industry-demos/ux-saas-principles.md` §4.2
