# OGP（Open Graph Protocol）実装ガイド

**作成日**: 2026-04-18
**対象プロジェクト**: おこづかいクエスト (otetsudai-bank)
**実装コミット**: `322707c` (deploy repo) / `3ff623b` (monorepo)

---

## 目次
1. [OGPとは](#1-ogpとは)
2. [本プロジェクトでの実装内容](#2-本プロジェクトでの実装内容)
3. [シェア用URL](#3-シェア用url)
4. [SNS投稿テンプレート](#4-sns投稿テンプレート)
5. [OGP表示の確認方法](#5-ogp表示の確認方法)
6. [トラブルシューティング](#6-トラブルシューティング)
7. [技術的な仕組み](#7-技術的な仕組み)
8. [OGP画像のカスタマイズ](#8-ogp画像のカスタマイズ)

---

## 1. OGPとは

**Open Graph Protocol**（Facebook策定、2010年〜の標準）
= Webページのメタ情報をSNS向けに標準化する仕組み。

### 効果

SNSでURLを貼った時、自動でリッチカード表示される:

```
┌──────────────────────────────┐
│ [🖼️ 大きな画像]               │
│                              │
│ おこづかいクエスト            │
│ お手伝いをクエストに...       │
│ 🌐 otetsudai-bank-beta.ver..  │
└──────────────────────────────┘
```

### OGPが無い場合 vs ある場合

| 項目 | 無し | 有り |
|------|------|------|
| 表示 | ただのURLテキスト | 大きな画像付きカード |
| 視認性 | 低 | 高 |
| クリック率 | 1-2% | 10-30% |
| 情報量 | URLのみ | 画像+タイトル+説明+ドメイン |

### 対応SNS（全て効く）

| プラットフォーム | 対応 | 使用タグ |
|----------------|------|---------|
| Facebook | ✅ | og:* |
| X (Twitter) | ✅ | og:* + twitter:* |
| LINE | ✅ | og:* |
| Slack | ✅ | og:* |
| Discord | ✅ | og:* |
| note | ✅ | og:* |
| Instagram | ❌ (リンク非対応) | - |

---

## 2. 本プロジェクトでの実装内容

### ファイル構成

```
otetsudai-bank/
├── app/
│   ├── api/og/
│   │   └── route.tsx           # OGP画像動的生成 (Next.js ImageResponse)
│   └── layout.tsx              # ルートページ metadata（Next.js標準）
└── public/
    └── promo.html              # PR動画ページ（静的HTMLに直接meta記述）
```

### 3つの実装箇所

#### ① `app/api/og/route.tsx` — OGP画像生成API
- Next.js 16+ の `ImageResponse` で動的PNG生成
- サイズ: 1200x630 (OGP標準)
- Edge Runtime で高速配信
- Google Fonts から Noto Sans JP を実行時ロード
- クエリパラメータで動的にテキスト変更可能

**URL**: `https://otetsudai-bank-beta.vercel.app/api/og`

**オプション** (任意):
```
/api/og?title=カスタムタイトル&sub=カスタムサブ&v=v1.0.0
```

#### ② `app/layout.tsx` — ルートページ metadata
Next.js 標準の `metadata.openGraph` / `metadata.twitter` で全子ページに自動適用:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://otetsudai-bank-beta.vercel.app"),
  title: "おこづかいクエスト | Habitica風RPG マネー教育アプリ",
  description: "お手伝いを「クエスト」に変えて...",
  openGraph: {
    type: "website",
    siteName: "おこづかいクエスト",
    title: "おこづかいクエスト v0.19.0 プロトタイプ",
    description: "...",
    url: SITE_URL,
    locale: "ja_JP",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "..." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "...",
    description: "...",
    images: [OG_IMAGE],
  },
};
```

#### ③ `public/promo.html` — 静的HTMLの<head>に直接meta記述
Next.js管理外の静的ファイルのため、生のmetaタグで対応:

```html
<!-- Open Graph (Facebook / LINE / Slack / Discord / note) -->
<meta property="og:title" content="おこづかいクエスト v0.19.0 プロトタイプ">
<meta property="og:description" content="...">
<meta property="og:image" content="https://otetsudai-bank-beta.vercel.app/api/og?title=...">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://otetsudai-bank-beta.vercel.app/promo.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="おこづかいクエスト">
<meta property="og:locale" content="ja_JP">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="https://otetsudai-bank-beta.vercel.app/api/og?...">
```

### OGP画像のデザイン

- **背景**: ダンジョンパープルグラデーション (`#1f0f31 → #2a1a4d`)
- **上下装飾**: ゴールドグラデーションバー
- **4隅**: 金色宝石装飾
- **左**: 直径180pxのコイン (¥マーク、放射グラデーション)
- **右**: 剣アイコン (25度回転)
- **センター**:
  - 「v0.19.0 プロトタイプ」バージョンバッジ (紫)
  - 「おこづかいクエスト」メインタイトル (ゴールド, 108px)
  - 「お手伝いをクエストに」サブタイトル (白, 44px)
  - ドメインURL (muted, 24px)

---

## 3. シェア用URL

### 推奨シェア先

```
🎥 PR動画ページ:
https://otetsudai-bank-beta.vercel.app/promo.html

🏠 アプリTOP:
https://otetsudai-bank-beta.vercel.app

🖼️ OGP画像単体 (参考):
https://otetsudai-bank-beta.vercel.app/api/og
```

### シェアの仕方

**SNSの投稿欄にURLを貼るだけ。** 以上。

```
✅ 正しい使い方:
────────────────
投稿欄:
子供向けマネー教育アプリ公開！
https://otetsudai-bank-beta.vercel.app/promo.html
────────────────
→ 自動でOGPカード展開

❌ 間違い:
────────────────
https://developers.facebook.com/tools/debug/?q=...
────────────────
→ これはデバッガーツール自体のURL
```

---

## 4. SNS投稿テンプレート

### X (Twitter) 用（140字目安）

```
お手伝いを「クエスト」に変える子供向けマネー教育アプリ
「おこづかいクエスト」v0.19.0 プロトタイプ公開🎮

⚔️ Habitica風RPG
🪙 3分割ウォレット(使う/貯める/増やす)
🐾 ペット育成
🏆 トロフィー

動画▶️ https://otetsudai-bank-beta.vercel.app/promo.html

#キッズテック #金融教育
```

### Facebook 用

```
子供向けマネー教育アプリ「おこづかいクエスト」v0.19.0 プロトタイプを公開しました。

お手伝いを「クエスト」としてゲーミフィケーションし、稼ぐ・貯める・増やすを体験的に学べる設計です。

主な機能:
◆ Habitica風ダークRPGテーマ
◆ クエストクリアでコイン獲得
◆ 3分割ウォレット（つかう/ためる/ふやす）
◆ ペット育成、トロフィーコレクション
◆ デイリーログインボーナス
◆ AIアシスタント「コインくん」

📹 PR動画（30秒）: https://otetsudai-bank-beta.vercel.app/promo.html
🎮 プロトタイプ: https://otetsudai-bank-beta.vercel.app

ご意見・フィードバックお待ちしています！
```

### note 記事内

```markdown
## プロトタイプを体験する

👉 [30秒PR動画](https://otetsudai-bank-beta.vercel.app/promo.html)
👉 [プロトタイプ本体](https://otetsudai-bank-beta.vercel.app)
```

noteはURLを貼ると自動でOGPカード展開されます。

### LINE

```
【プロトタイプ公開】おこづかいクエスト
お手伝いを楽しくクエスト化する子供向けアプリ
https://otetsudai-bank-beta.vercel.app/promo.html
```

---

## 5. OGP表示の確認方法

### ① 総合プレビュー（推奨）

**OpenGraph.xyz**
```
https://www.opengraph.xyz/url/https%3A%2F%2Fotetsudai-bank-beta.vercel.app%2Fpromo.html
```

各SNS（Facebook/X/LinkedIn/Discord/Slack）の見た目を一括プレビュー可能。

### ② Facebook公式デバッガー

```
https://developers.facebook.com/tools/debug/
```

使い方:
1. 上記URLを開く
2. URL入力欄に `https://otetsudai-bank-beta.vercel.app/promo.html` を入力
3. 「デバッグ」ボタンをクリック
4. 画像が古い場合は「**もう一度スクレイピング**」で強制更新

### ③ 直接OGP画像を表示

```
https://otetsudai-bank-beta.vercel.app/api/og
```
ブラウザで直接開くと生成されたPNG画像を見れます。

### ④ 実際の投稿で試す（テスト用アカウント推奨）

1. SNS投稿欄にURLを貼る
2. 数秒待つ（SNSがOGPを取得）
3. URLの下にカードが出現
4. 問題なければそのまま投稿、またはテキスト整えて公開

---

## 6. トラブルシューティング

### Q1. OGPカードが表示されない

**原因候補と対処:**

| 原因 | 対処 |
|------|------|
| SNSのキャッシュが古い | Facebook Debugger で「スクレイピング再実行」 |
| Vercelのデプロイ遅延 | 5分待って再試行 |
| URLが間違っている | `/promo.html` まで含めて正しいか確認 |
| プライベート設定 | SNS側でリンクプレビュー有効化を確認 |

### Q2. Xで画像が小さい

- `twitter:card` が `summary_large_image` になっているか確認
- 画像サイズが 1200x630 になっているか確認

### Q3. LINEでカードが出ない

- LINEは送信相手側のキャッシュに依存
- 個人チャットで送信してから、他のチャットでも試す

### Q4. 画像が真っ白

- `/api/og` が200を返すか直接確認
- Vercel Functionsログを確認（Next.js `next/og` のエラー）
- フォント読み込み失敗の可能性 → コード内のfallback処理が効いているか

### Q5. 古いOGPが残る

**Facebook**:
```
https://developers.facebook.com/tools/debug/
→ URL入力 → "Scrape Again"
```

**X**:
Xは独自キャッシュ（約7日）。急ぐなら別URLで再投稿（?v=2 等つける）。

**LINE/Slack/Discord**:
キャッシュ永続化されない。自動で最新OGP取得。

---

## 7. 技術的な仕組み

### Next.js `ImageResponse` のフロー

```
[SNS] URL貼り付け
    ↓
[SNS] metaタグをHEAD解析
    ↓
[SNS] og:image のURL取得
    ↓
https://.../api/og にGET
    ↓
[Vercel Edge Runtime 起動]
    ↓
[Next.js ImageResponse]
    ↓ React JSX
    ↓ satori (SVG化)
    ↓ @resvg/resvg-js (SVG→PNG)
    ↓
PNG画像を返却
    ↓
[SNS] キャッシュ & カード表示
```

**ポイント**:
- 1回目のリクエスト時のみ生成（Edge Cache）
- Google Fonts からの動的ロードでJapanese対応
- 画像はVercelのCDNにキャッシュされる

### 動的クエリパラメータ対応

```
/api/og                              → デフォルト
/api/og?title=新機能リリース           → タイトル変更
/api/og?title=X&sub=Y&v=v2.0         → 全要素変更
```

これで同じAPIで**記事ごと・キャンペーンごと**に異なるOGP画像が作れます。

**使用例**:
```html
<!-- 新機能記事のOGP -->
<meta property="og:image" content="/api/og?title=ペットシステム実装&v=v0.18">

<!-- プレスリリースのOGP -->
<meta property="og:image" content="/api/og?title=プレスリリース&sub=資金調達完了">
```

### ファイルサイズ・パフォーマンス

- **初回生成**: 約500-1500ms (フォントロード含む)
- **2回目以降**: Vercel CDN キャッシュヒット (<50ms)
- **PNG サイズ**: 約40-80KB
- **コスト**: Vercel Free tier 範囲内（月10万リクエスト程度なら無料）

---

## 8. OGP画像のカスタマイズ

### テキストを変更する

`app/api/og/route.tsx` の冒頭にある定数を変更:

```tsx
const title = searchParams.get("title") ?? "おこづかいクエスト";
const sub = searchParams.get("sub") ?? "お手伝いをクエストに";
const version = searchParams.get("v") ?? "v0.19.0 プロトタイプ";
```

### 色を変更する

JSX内のstyle属性を編集:
```tsx
background: "linear-gradient(135deg, #1f0f31 0%, #2a1a4d 50%, #1f0f31 100%)",
                              ^^^^^^^ ^^^^^^^ ^^^^^^^
                              ここ    ここ    ここ
```

### 装飾要素（コイン/剣）を変更する

`app/api/og/route.tsx` 内のposition absolute要素を編集。

### 新しい画像URLパターンを追加

例えばニュース記事用 `/api/og/news?title=...` が欲しいなら:
```
app/api/og/
  ├── route.tsx          # デフォルト
  └── news/
      └── route.tsx      # ニュース用（ヘッダーロゴ無しなど差別化）
```

### プレビュー確認

ローカル開発時:
```bash
npm run dev
open http://localhost:3000/api/og
open http://localhost:3000/api/og?title=テスト
```

---

## 参考リンク

### 公式ドキュメント

- **OGP仕様**: https://ogp.me/
- **Next.js Metadata**: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- **Next.js OG Image**: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- **ImageResponse**: https://nextjs.org/docs/app/api-reference/functions/image-response
- **Twitter Cards**: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards

### チェックツール

- **OpenGraph.xyz**: https://www.opengraph.xyz/ （総合チェッカー）
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### デザインリファレンス

- **Vercel OG Playground**: https://og-playground.vercel.app/
- **Metatags.io**: https://metatags.io/ （プレビュー+コード生成）

---

## 変更履歴

| 日付 | 内容 | コミット |
|------|------|---------|
| 2026-04-18 | 初版作成。OGP画像動的生成API + promo.html + layout.tsx metadata | 322707c (deploy) / 3ff623b (monorepo) |
