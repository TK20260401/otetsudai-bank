# おこづかいクエスト — お手伝い＝クエスト！マネー冒険アプリ（v0.3）

## 概要

**お手伝い＝クエスト。子供が冒険感覚でお手伝いをこなし、稼ぎ、貯めて、増やすを体験できる家族向けマネー教育アプリ。**

日本の家庭の「お手伝い」文化をベースに、タスク達成→報酬→バッジのゲーミフィケーションで子供が労働の対価・貯金・支出管理を自然に学べる。

## URL

| 項目 | URL |
| --- | --- |
| 本番 | https://otetsudai-bank-beta.vercel.app |
| ワイヤーフレーム | https://otetsudai-bank-beta.vercel.app/docs/wireframe.html |
| モックアップ | https://otetsudai-bank-beta.vercel.app/docs/mockup.html |
| GitHub | https://github.com/TK20260401/otetsudai-bank |

## 独自性

| 特徴 | 内容 |
| --- | --- |
| 完全日本語 | ふりがな付きで小学生でも読める（AutoRuby辞書80語） |
| クエスト世界観 | お手伝い＝クエスト、完了＝クリア、バッジ収集のゲーミフィケーション |
| 日本円ウォレット | 仮想通貨ではなく日本円ベースで実感しやすい |
| AIアドバイザー | 親向け（マネー教育のコツ）/ 子供向け（お金の豆知識） |
| 全額親承認制 | 稼ぎも支出もすべて親の承認が必要（教育的設計） |

## 機能一覧

| 機能 | 内容 |
| --- | --- |
| ランディングページ | クエスト世界観のアプリ紹介、「ぼうけんをはじめる」ボタン |
| サインアップ | メール+PW→Supabase Auth→家族名→子供アカウント1〜5名（PIN説明付き） |
| ログイン | 家族選択→メンバー→PIN認証（PIN説明テキスト付き） |
| クエスト管理（親） | クエストCRUD（名前・説明・報酬・繰り返し・担当）、絵カード30種自動割当 |
| 親ダッシュボード | 承認待ち（クエスト+支出）、子供残高・貯蓄率・分割比率設定、4指標 |
| 支出承認 | 子供「つかう」申請→親承認/却下（却下理由付き→子供に表示） |
| 分割比率設定 | 親が子供ごとに「ちょきん割合」をスライダーで変更 |
| 子供ダッシュボード | 動的🐷貯金箱、きょうのクエスト、クエストリスト、取引履歴 |
| 貯金目標 | 子供が目標名+金額を設定、進捗バー、達成時🎉演出 |
| 達成バッジ | ⚔️はじめてのクエスト / 🔥3日れんぞく / 💰1000円たっせい / 🐷ちょきんマスター / 🏆クエストマスター |
| クエストクリア演出 | 🪙コインアニメーション |
| AIチャット（全ページ） | 子供向け「コインくん🪙」/ 親向け「クエストアドバイザー💬」/ 未ログイン「クエストガイド⚔️」 |
| ふりがな | 子供画面の全漢字にルビ自動付与 |
| ヘルプ | 3ステップガイド、子供/親向け説明、FAQ |
| PWA | manifest.json対応（standalone・テーマカラー#059669） |

## テーマカラー

| 用途 | カラー |
| --- | --- |
| メイン（冒険） | エメラルドグリーン #059669 |
| コイン・報酬 | アンバー #f59e0b |
| バッジ・特別 | バイオレット #7c3aed |
| 背景グラデーション | emerald-50 → amber-50 |

## DBテーブル（Supabase / 9テーブル）

| テーブル | 用途 |
| --- | --- |
| `otetsudai_families` | 家族マスター |
| `otetsudai_users` | ユーザー（parent/child、PIN、Supabase Auth連携） |
| `otetsudai_tasks` | クエスト定義（報酬額・繰り返し・担当） |
| `otetsudai_task_logs` | クエスト完了ログ（pending→approved/rejected） |
| `otetsudai_wallets` | 子供別ウォレット（spending/saving残高・分配比率） |
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
| Anthropic Claude API | claude-sonnet-4-20250514 | AIチャット（3ロール対応） |
| TypeScript | 5.x | 型安全 |
| Vercel | — | ホスティング |

## バージョン履歴

| Version | Date | Changes |
| --- | --- | --- |
| v0.1 | 2026-04-07 | 初期構築。ログイン、親ダッシュボード、タスク管理、子供ダッシュボード、ウォレット自動分配、Supabase DB 6テーブル |
| v0.1.1 | 2026-04-07 | タスク絵カードアイコン30種、子供画面全漢字ルビ、AIチャット（コインくん/アドバイザー）、ヘルプページ、タスク25件追加 |
| v0.2 | 2026-04-07 | ランディング、サインアップ（Supabase Auth）、支出承認、分割比率UI、貯金目標、バッジ4種、コインアニメ、動的🐷、きょうやること、共通ヘッダー、PWA、DB 3テーブル追加 |
| v0.3 | 2026-04-08 | 「おこづかいクエスト」にリブランド。クエスト世界観統一（タスク→クエスト、完了→クリア）、テーマカラー変更（amber→emerald）、AIチャット全ページ化（layout.tsx一元化、ゲスト対応）、🏆クエストマスターバッジ追加、PIN説明テキスト追加 |

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
