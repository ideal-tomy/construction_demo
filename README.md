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
**本番URL:** https://construction-demo-six.vercel.app

## 本番URLについて（重要）

Vercel 上のプロジェクト名は `construction-demo` です。ダッシュボードに `two` とは出ません。

公開URLが `construction-demo-six.vercel.app` なのは、`construction-demo.vercel.app` が別会社に取られているためです。`-two` はバージョン番号ではありません。

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
# NEXT_PUBLIC_AXEON_CONTACT_URL=https://www.axeon.jp/contact
# NEXT_PUBLIC_IDEAL_CONTACT_URL=https://ideal-official-three.vercel.app/contact
```

## ブランド別の入口と見積もり

- AXEON: `/?brand=axeon`。IDEAL: `/?brand=ideal`。
- ブランド未指定・不正値は従来互換でIDEAL。写真・報告・管理画面へ直接入る場合も `brand` を指定できます。
- 画面間のリンク、見積もり、相談先は同じブランドを使用します。共有ブラウザストレージにブランドは保存しません。
- 相談先の上書きはブランド別の変数を使用します。既存 `NEXT_PUBLIC_CONTACT_URL` はIDEALだけの互換設定です。
- ブランド名・公式サイト・既定問い合わせ先は `lib/demo-brand.ts` の `DEMO_BRANDS` で管理します。問い合わせ先の上書きは同ブランドの許可済みHTTPSオリジンのみを受け付け、不正値・別ブランド・未登録ドメインは既定問い合わせ先に戻します。公式ドメインを変更する際はこの設定も更新してください。
- 見積もりURLはサーバーで解決して完了CTAにも渡します。`NEXT_PUBLIC_ROI_SIMULATOR_URL` が未設定ならCTAは非表示ですが、本番で見積もりを提供する場合は設定が必須です。設定後は再ビルド・再デプロイして実導線を確認してください。

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

- [トップ画面の紹介アニメーション：構造と横展開指示](docs/demo-intro-reuse-guide.md)
- ideal PLAN: `sites/ideal_official/docs/industry-demos/construction.md`
- UX原則: `sites/ideal_official/docs/industry-demos/ux-saas-principles.md` §4.2
