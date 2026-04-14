# おこづかいクエスト ベンダー／管理者ガイド

運用・管理者向けのセットアップ手順、管理機能、トラブルシューティングをまとめたドキュメントです。

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| フロントエンド | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| バックエンド | Supabase (PostgreSQL + Auth + Edge Functions) |
| AI | Claude API (Anthropic SDK) |
| ホスティング | Vercel |
| 認証 | Supabase Auth (親/admin)、PIN認証 (子ども) |

---

## セットアップ

### 環境変数

`.env.local` に以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase Service Role Key>
ANTHROPIC_API_KEY=<Claude API Key>
```

### ローカル起動

```bash
cd otetsudai-bank
npm install
npm run dev
```

### デプロイ

Vercel に接続済み。`main` ブランチへの push で自動デプロイされます。

```bash
# 手動プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

---

## データベース構成

### 主要テーブル

| テーブル | 用途 |
|----------|------|
| `otetsudai_families` | 家族（世帯）マスター |
| `otetsudai_users` | ユーザー（parent/child/admin の3ロール） |
| `otetsudai_tasks` | クエスト（お手伝い）定義 |
| `otetsudai_task_logs` | クエスト完了・承認履歴 |
| `otetsudai_wallets` | ウォレット（spending/saving/investing 3分割） |
| `otetsudai_transactions` | 取引履歴 |
| `otetsudai_spend_requests` | 子どもの支出申請 |
| `otetsudai_badges` | バッジ（実績） |
| `otetsudai_saving_goals` | 貯金目標 |
| `otetsudai_stock_prices` | 株価マスター |
| `otetsudai_invest_orders` | 投資注文 |
| `otetsudai_invest_portfolios` | 投資ポートフォリオ |
| `otetsudai_announcements` | お知らせ配信 |
| `otetsudai_settings` | システム設定（メンテナンスモード等） |
| `otetsudai_messages` | 親子チャットメッセージ |

全テーブルに RLS (Row Level Security) を適用済み。

### ロール体制

| ロール | 認証方式 | 権限 |
|--------|----------|------|
| parent | Supabase Auth (メール+PW) | 自家族のCRUD、子どもの承認 |
| child | PIN認証 (localStorage) | 自分のクエスト完了報告、申請 |
| admin | Supabase Auth (メール+PW) | 全家族閲覧、お知らせ、メンテナンス、株価管理 |

---

## 管理者ダッシュボード (`/admin`)

### アクセス方法

1. `/login` → 「管理者ログイン」タブ
2. admin ロールのメール+パスワードでログイン

### 初回管理者作成

`/api/admin-setup` に POST リクエストで初回 admin アカウントを作成。

### 機能一覧

#### 1. システム統計

ダッシュボード上部に表示:
- 家族数、親アカウント数、子どもアカウント数
- アクティブなクエスト数、本日の承認数

#### 2. 家族一覧・管理

- 全世帯の一覧表示（メンバー数付き）
- 家族データの削除（カスケード削除）

#### 3. お知らせ配信

| 項目 | 説明 |
|------|------|
| タイトル | お知らせの見出し |
| 本文 | 内容 |
| 対象 | all / parent / child |
| 優先度 | normal / important / urgent |
| 有効期限 | 自動で非表示になる日時（任意） |

お知らせはユーザーのダッシュボードにバナーとして表示されます。

#### 4. 株価マスター管理

- 銘柄の追加・編集・削除
- 各銘柄の情報: シンボル、名前（日英）、カテゴリ（index/jp_stock/us_stock）、通貨、子ども向け説明
- Alpha Vantage API からの価格同期（1銘柄ずつ、レート制限対応）

#### 5. メンテナンスモード

- ON/OFF の切り替え（確認ダイアログ付き）
- カスタムメッセージ設定
- admin ユーザーは影響を受けずにアクセス可能
- 設定は `otetsudai_settings` テーブルに保存（30秒キャッシュ）

---

## API エンドポイント

| エンドポイント | メソッド | 用途 |
|---------------|---------|------|
| `/api/chat` | POST | AI チャット（子ども/親/ゲスト対応） |
| `/api/account` | DELETE | 家族アカウント削除 |
| `/api/family` | DELETE | 家族データ完全削除 |
| `/api/announcements` | GET/POST/PATCH/DELETE | お知らせ CRUD |
| `/api/settings` | GET/POST | メンテナンスモード設定 |
| `/api/spend-request` | POST/PUT | 支出申請の作成・承認 |
| `/api/stock-sync` | POST | 株価同期（Alpha Vantage） |
| `/api/admin-setup` | POST | 初回 admin 作成 |

---

## 運用手順

### 株価更新

1. 管理者ダッシュボード → 「株価マスター」
2. 「最新価格を取得」ボタン
3. Alpha Vantage API の無料枠はリクエスト制限あり（5回/分、500回/日）
4. 全銘柄を1つずつ順次同期（進捗表示あり）

### 新しい家族の追加

現在はユーザー自身がサインアップ画面（`/signup`）から登録。管理者による追加は DB 直接操作。

### 障害時の対応

1. **メンテナンスモードを有効化**（管理者ダッシュボード → メンテナンスモード → ON）
2. 原因調査・修正
3. デプロイ後にメンテナンスモードを解除

### ログ確認

- Vercel ダッシュボード → Functions ログ
- Supabase ダッシュボード → Database → Logs

---

## セキュリティ

| 項目 | 実装 |
|------|------|
| 認証 | Supabase Auth (メール確認必須、PW 8文字以上) |
| 子ども認証 | PIN 暗号化 (pgcrypto + bcrypt) |
| RLS | 全テーブルに適用。各ロールが自分のデータのみアクセス可能 |
| admin 分離 | admin は独立ロール。家族データへの書き込みは不可（閲覧・削除のみ） |
| 金融 | 仮想コインのみ。実際の資金移動機能なし（規制対象外） |

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| ログインできない | メール未認証 | 確認メールのリンクをクリック |
| 株価が更新されない | Alpha Vantage レート制限 | 数分待ってから再試行 |
| 子どもの画面が白い | localStorage セッション切れ | 再ログイン |
| デプロイ後に500エラー | 環境変数未設定 | Vercel の Environment Variables を確認 |
| RLS エラー | ポリシー不足 | Supabase Dashboard で該当テーブルのポリシーを確認 |
