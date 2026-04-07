# おてつだいバンク — お手伝い×マネー教育アプリ

## 概要

**子どものお手伝いを「見える化」し、お金の管理を楽しく学べるファミリー向けWebアプリ**

お手伝いを完了→親が承認→コインが貯まる。「つかえるお金」と「ちょきん」に自動分配され、子どもが自然にお金の使い方・貯め方を体験できる。

**URL**: （Vercelデプロイ予定）

## 機能一覧

| 機能 | 内容 |
| --- | --- |
| ログイン | 家族選択→メンバー選択→PIN認証（PINなしも可） |
| 親ダッシュボード | 承認待ちタスク一覧、承認/却下ワンタップ、子ども別残高・貯蓄率表示、週間統計 |
| タスク管理 | タスクCRUD（名前・説明・報酬額・繰り返し設定・担当子ども指定）、有効/無効切替 |
| 子どもダッシュボード | 貯金箱UI（つかえるお金/ちょきん分離表示）、貯蓄目標プログレスバー |
| おてつだい実行 | アクティブタスク一覧から「できた！」ボタンで完了申請 |
| 取引履歴 | 獲得・使用の履歴をタブ切替で確認 |
| ウォレット | 報酬を分配比率（split_ratio）で「つかえるお金」「ちょきん」に自動振り分け |
| セッション管理 | localStorage方式、ロール別ルーティング（parent/child） |
| レスポンシブ | モバイル/タブレット/PC対応 |

## DBテーブル（Supabase）

| テーブル | 用途 |
| --- | --- |
| `otetsudai_families` | 家族マスター |
| `otetsudai_users` | ユーザー（parent/child、PIN認証） |
| `otetsudai_tasks` | お手伝いタスク定義（報酬額・繰り返し・担当） |
| `otetsudai_task_logs` | タスク完了ログ（pending→approved/rejected） |
| `otetsudai_wallets` | 子ども別ウォレット（spending/saving残高・分配比率） |
| `otetsudai_transactions` | 取引履歴（earn/spend/save） |

## 技術スタック

| Technology | Version | Purpose |
| --- | --- | --- |
| Next.js (App Router) | 16.2.2 | フレームワーク |
| React | 19.2.4 | UI構築 |
| Tailwind CSS | 4.x | スタイリング |
| shadcn/ui | 4.1.2 | UIコンポーネント（Card, Button, Dialog, Tabs, Progress等） |
| Supabase | 2.x | DB（PostgreSQL）・認証 |
| TypeScript | 5.x | 型安全 |
| Vercel | — | ホスティング |

## ページ構成

```
app/
├── page.tsx                    ← ログイン（家族→メンバー→PIN）
├── parent/
│   ├── page.tsx                ← 親ダッシュボード（承認・残高一覧）
│   └── tasks/
│       └── page.tsx            ← タスク管理（CRUD）
└── child/
    └── [childId]/
        └── page.tsx            ← 子どもダッシュボード（貯金箱・おてつだい・履歴）
```

## Getting Started

```bash
cd otetsudai-bank
npm install
npm run dev
```

`.env.local` に以下の環境変数が必要:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
