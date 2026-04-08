# おてつだいバンク — お手伝い×マネー教育アプリ（v0.2）

## 概要

**「BusyKid」日本版 — 子どものお手伝いを「見える化」し、お金の管理を楽しく学べるファミリー向けWebアプリ**

お手伝いを完了→親が承認→コインが貯まる。「つかえるお金」と「ちょきん」に自動分配。子どもの支出もすべて親の承認制。貯金目標を設定し、達成バッジでモチベーションを維持。

## URL

| 項目 | URL |
| --- | --- |
| 本番 | https://otetsudai-bank-beta.vercel.app |
| ワイヤーフレーム | https://otetsudai-bank-beta.vercel.app/docs/wireframe.html |
| モックアップ | https://otetsudai-bank-beta.vercel.app/docs/mockup.html |
| GitHub | https://github.com/TK20260401/otetsudai-bank |

## 機能一覧

| 機能 | 内容 |
| --- | --- |
| ランディングページ | BusyKid日本版コンセプト訴求、「はじめる」「ログイン」ボタン |
| サインアップ | メール+パスワード→Supabase Auth登録→家族名入力→子供アカウント1〜5名追加 |
| ログイン | 家族選択→メンバー選択→PIN認証（PINなしも可） |
| 親ダッシュボード | 承認待ち（タスク+支出）、子ども別残高・貯蓄率・分割比率設定、4指標（承認済・総獲得・今週件数・今週支払） |
| タスク管理 | タスクCRUD（名前・説明・報酬額・繰り返し設定・担当子ども指定）、絵カードアイコン自動割当、有効/無効切替 |
| 支出承認 | 子供「つかう」申請（金額+用途）→親が承認/却下（却下理由付き）→ウォレット反映 |
| 分割比率設定 | 親が子供ごとに「ちょきん割合」をスライダーで変更（0-100%） |
| 子どもダッシュボード | 動的貯金箱UI（残高で🐷変化）、きょうやること、おてつだいリスト、取引履歴 |
| 貯金目標 | 子供が目標名+金額を設定、進捗バー表示、達成時🎉演出 |
| 達成バッジ | 🌟はじめてのおてつだい / 🔥3日れんぞく / 💰1000円たっせい / 🐷ちょきんマスター |
| コインアニメーション | タスク完了時に🪙演出（紙吹雪風） |
| AIチャット | 子供向け「コインくん🪙」（ひらがな・絵文字）/ 親向け「アドバイザー💬」（丁寧語・教育的） |
| ふりがな | 子供向け画面の全漢字にルビ自動付与（AutoRuby辞書80語） |
| ヘルプ | 3ステップガイド、子供/親向け説明、FAQ |
| PWA | manifest.json対応（standalone・テーマカラー#f59e0b） |
| レスポンシブ | モバイル/タブレット/PC対応 |

## ステータスアイコンマッピング（30種）

| アイコン | タスク | アイコン | タスク |
| --- | --- | --- | --- |
| 🍽️ | 食器洗い | 🍳 | 料理のお手伝い |
| 👕 | 洗濯物たたみ | 🧺 | 洗濯物を取り込む |
| 🧹 | 床掃除 | 🛁 | お風呂掃除 |
| 🚽 | トイレ掃除 | 🪟 | 窓拭き |
| 🗑️ | ゴミ出し | ♻️ | ゴミの分別 |
| 🌿 | 芝刈り | 🌻 | 水やり |
| 🌱 | 草むしり | 🍂 | 落ち葉ひろい |
| 🐕 | ペットの散歩 | 🛒 | おつかい |
| 📚 | 宿題 | 📖 | 読書 |
| 👟 | 靴揃え | 🛏️ | 布団たたみ |
| 💆 | 肩たたき | 📰 | 新聞・郵便取り |
| 🚗 | 洗車 | 🎒 | 学校の準備 |
| 🗂️ | 片付け | 🥢 | 配膳 |
| 🧽 | テーブル拭き | 🚪 | 玄関掃除 |
| 👔 | 着替え | ⭐ | その他 |

## DBテーブル（Supabase）

| テーブル | 用途 |
| --- | --- |
| `otetsudai_families` | 家族マスター |
| `otetsudai_users` | ユーザー（parent/child、PIN認証、Supabase Auth連携） |
| `otetsudai_tasks` | お手伝いタスク定義（報酬額・繰り返し・担当） |
| `otetsudai_task_logs` | タスク完了ログ（pending→approved/rejected） |
| `otetsudai_wallets` | 子ども別ウォレット（spending/saving残高・分配比率） |
| `otetsudai_transactions` | 取引履歴（earn/spend/save） |
| `otetsudai_spend_requests` | 支出申請（金額・用途・承認/却下・却下理由） |
| `otetsudai_badges` | 達成バッジ（badge_type・earned_at） |
| `otetsudai_saving_goals` | 貯金目標（目標名・目標金額・達成フラグ） |

## 技術スタック

| Technology | Version | Purpose |
| --- | --- | --- |
| Next.js (App Router) | 16.2.2 | フレームワーク |
| React | 19.2.4 | UI構築 |
| Tailwind CSS | 4.x | スタイリング |
| shadcn/ui | 4.1.2 | UIコンポーネント |
| Supabase | 2.x | DB（PostgreSQL）・Auth |
| Anthropic Claude API | claude-sonnet-4-20250514 | AIチャットアシスタント |
| TypeScript | 5.x | 型安全 |
| Vercel | — | ホスティング |

## ページ構成

```
app/
├── page.tsx                        ← ランディングページ（BusyKid日本版紹介）
├── login/page.tsx                  ← ログイン（家族→メンバー→PIN）
├── signup/
│   ├── page.tsx                    ← 親サインアップ（メール+PW+家族名）
│   └── children/page.tsx           ← 子供アカウント登録（1〜5名）
├── parent/
│   ├── page.tsx                    ← 親ダッシュボード（承認・支出承認・残高・分割比率）
│   └── tasks/page.tsx              ← タスク管理（CRUD・アイコン付き）
├── child/[childId]/page.tsx        ← 子どもダッシュボード（貯金箱・バッジ・きょうやること・つかう・履歴）
├── help/page.tsx                   ← ヘルプ・FAQ
├── api/
│   ├── chat/route.ts               ← AIチャットAPI（Claude連携）
│   └── spend-request/route.ts      ← 支出申請API（申請・承認・却下）
components/
├── common-header.tsx               ← 共通ヘッダー（戻る・ログアウト統一）
├── chat-widget.tsx                 ← AIチャットウィジェット（親/子でペルソナ切替）
├── ruby-text.tsx                   ← ふりがなコンポーネント（R + AutoRuby辞書80語）
├── badge-display.tsx               ← 達成バッジ表示
├── coin-animation.tsx              ← コイン獲得演出
├── saving-goal.tsx                 ← 貯金目標設定・表示
├── ui/                             ← shadcn/uiコンポーネント
lib/
├── types.ts                        ← 全型定義（9テーブル対応）
├── supabase.ts                     ← Supabaseクライアント
├── session.ts                      ← セッション管理（localStorage）
├── task-icons.ts                   ← タスク→アイコンマッピング（30種）
├── badges.ts                       ← バッジ判定ロジック（4種）
docs/
├── wireframe.html                  ← ワイヤーフレーム（表側/裏側）
├── mockup.html                     ← インタラクティブモックアップ
```

## バージョン履歴

| Version | Date | Changes |
| --- | --- | --- |
| v0.1 | 2026-04-07 | 初期構築。ログイン（家族→メンバー→PIN）、親ダッシュボード（承認・残高）、親タスク管理（CRUD・繰り返し）、子供ダッシュボード（貯金箱・タスク・履歴）、ウォレット自動分配、Supabase DB（6テーブル）、shadcn/ui、レスポンシブ |
| v0.1.1 | 2026-04-07 | タスク絵カードアイコン30種追加、子供画面全漢字ルビ（AutoRuby辞書80語）、AIチャットアシスタント（子供向けコインくん🪙/親向けアドバイザー💬）、ヘルプページ、新規タスク25件追加（合計30件） |
| v0.2 | 2026-04-07 | BusyKid日本版コンセプト導入。ランディングページ、サインアップフロー（Supabase Auth+家族+子供登録）、支出承認フロー（つかう申請→親承認/却下+理由）、分割比率設定UI、貯金目標（設定・進捗・達成演出）、達成バッジ4種（🌟🔥💰🐷）、コインアニメーション、動的貯金箱、きょうやること、共通ヘッダー、親ダッシュボード強化（4指標+支出承認キュー）、PWA manifest、DB 3テーブル追加（計9テーブル） |

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
ANTHROPIC_API_KEY=your_anthropic_api_key
```
