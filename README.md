# おこづかいクエスト — お手伝い＝クエスト！マネー冒険アプリ（v0.6）

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
| ユニバーサルデザイン | 色＋アイコンの二重符号化、大型タッチターゲット、aria対応 |

## 機能一覧

| 機能 | 内容 |
| --- | --- |
| ランディングページ | クエスト世界観のアプリ紹介。ログイン済み自動リダイレクト（親→/parent、子→/child/[id]）。UDカラー3色（赤:つかう・青:ためる・緑:ふやす）のフィーチャーカード |
| サインアップ | メール+PW→Supabase Auth→家族名→子供アカウント1〜5名（PIN説明付き） |
| ログイン | 家族選択→メンバー→PIN認証（PIN説明テキスト付き） |
| クエスト管理（親） | クエストCRUD（名前・説明・報酬・繰り返し・担当）、絵カード30種自動割当 |
| 親ダッシュボード | 承認キュー最優先（クエスト完了・支出・提案・メッセージ）、空状態ウェルカムカード、子供残高3色表示（赤:つかう・青:ためる・緑:ふやす）、UD対応分配スライダー、累計情報は控えめ表示 |
| 支出承認 | 子供「つかう」申請→親承認/却下（却下理由付き→子供に表示） |
| 報酬3分割スライダー | 親が子供ごとに「つかう・ためる・ふやす」の比率をスライダーで設定。赤/青/緑のカラーバーで視覚化。save_ratio + invest_ratio で制御（spend は自動算出） |
| 子供ダッシュボード | 動的🐷貯金箱、きょうのクエスト、クエストリスト、取引履歴 |
| クエスト構造化UI | 「準備→実行→完了」の3ステップチェックリスト形式。順序制約（前ステップ未完了でロック）。習熟度（見習い🌱 x1 / 助手⭐ x1.5 / リーダー👑 x2）による報酬倍率切り替え |
| 貯金目標 | 子供が目標名+金額を設定、進捗バー、達成時🎉演出 |
| 達成バッジ | ⚔️はじめてのクエスト / 🔥3日れんぞく / 💰1000円たっせい / 🐷ちょきんマスター / 🏆クエストマスター |
| クエストクリア演出 | 🪙コインアニメーション |
| AIチャット（全ページ） | 子供向け「コインくん🪙」/ 親向け「クエストアドバイザー💬」/ 未ログイン「クエストガイド⚔️」 |
| ふりがな | 子供画面の全漢字にルビ自動付与 |
| ヘルプ | 3ステップガイド、子供/親向け説明、FAQ |
| PWA | manifest.json対応（standalone・テーマカラー#059669）、Service Worker |
| RLSセキュリティ | 全テーブルにRow Level Security有効化。PIN認証（localStorage）ベースのためanon許可ポリシー併設。アプリ側でsession.familyIdフィルタ |
| PIN暗号化 | pgcrypto拡張によるbcryptハッシュ保存、平文PINを保持しない設計（verify_pin/set_pin_hash RPC関数） |
| アカウント削除 | 親ダッシュボードからsoft delete（確認テキスト「削除する」入力必須）、Supabase Auth連携削除 |
| 法務ページ | プライバシーポリシー（/privacy）、利用規約（/terms）、フッターからリンク |
| サービス層分離 | lib/services/（auth.ts/tasks.ts/wallets.ts/families.ts）にDB操作を集約 |
| おこさま後追加 | 親ダッシュボードからいつでも子供を追加可能（初回登録時のみの制約を解消） |
| じぶんクエスト | プリセット10種プルダウン選択＋カスタム自由入力。報酬はトップダウン（親設定基準額、カスタムのみ子供入力）。スタンプ6種＋メッセージ付き提案→親が承認/却下。RLSポリシーでpending提案のみ許可 |
| レベルアップ | 累計獲得額に基づく7段階ランク（🗡️ぼうけんしゃ→👑でんせつのゆうしゃ）。プログレスバー付き |
| 承認スタンプ | 親が承認時にLINE風スタンプ（8種）＋ひとことメッセージを送信。子供ダッシュボードに通知表示 |
| 外部決済連携 | 支出承認後にPayPay/B43/LINE Payへのディープリンク起動ダイアログ。フォールバックURL付き |
| 株価連動Invest | Alpha Vantage API連携のSupabase Edge Function。投資ポートフォリオテーブル＋フロントエンド表示 |
| PWA強化 | maskableアイコン、shortcuts、Cache First/Network First分離SW、Apple PWAメタ対応 |
| メンテナンスモード | `NEXT_PUBLIC_MAINTENANCE_MODE=true`で全画面メンテナンス表示。Vercel環境変数で即時切替 |

## ユニバーサルデザイン（UD）設計方針

v0.5で導入したUD対応の設計方針：

| 手法 | 適用箇所 | 効果 |
| --- | --- | --- |
| 色＋アイコンの二重符号化 | 全画面（💰赤:つかう / 🐷青:ためる / 🌱緑:ふやす） | 色覚特性に関わらず意味を伝達 |
| 大型タッチターゲット | TOP画面ボタン（py-5/text-xl）、クエストステップボタン | 子供の小さな指でも操作しやすい |
| aria-label / aria-hidden | 装飾アイコン・操作ボタンすべて | スクリーンリーダー対応 |
| 順序制約の視覚表現 | クエスト構造化UI（🔒+opacity+disabled） | 次に何をすべきか一目でわかる |
| プログレスバー | クエストステップ、貯金目標 | 進捗を直感的に把握 |
| カラーバーによる比率可視化 | 報酬分配スライダー | 数字が読めなくても配分を理解可能 |

## テーマカラー

| 用途 | カラー | カラーコード |
| --- | --- | --- |
| メイン（冒険） | エメラルドグリーン | #059669 |
| つかう（Spend） | レッド | red-400〜red-700 |
| ためる（Save） | ブルー | blue-400〜blue-700 |
| ふやす（Invest） | グリーン | green-400〜green-700 |
| コイン・報酬 | アンバー | #f59e0b |
| バッジ・特別 | バイオレット | #7c3aed |
| 背景グラデーション | — | emerald-50 → amber-50 |

## DBテーブル（Supabase / 9テーブル）

| テーブル | 用途 |
| --- | --- |
| `otetsudai_families` | 家族マスター |
| `otetsudai_users` | ユーザー（parent/child、PIN、Supabase Auth連携） |
| `otetsudai_tasks` | クエスト定義（報酬額・繰り返し・担当） |
| `otetsudai_task_logs` | クエスト完了ログ（pending→approved/rejected） |
| `otetsudai_wallets` | 子供別ウォレット（spending/saving/invest残高・save_ratio/invest_ratio分配比率） |
| `otetsudai_transactions` | 取引履歴（earn/spend/save/invest） |
| `otetsudai_spend_requests` | 支出申請（金額・用途・承認/却下・却下理由） |
| `otetsudai_badges` | 達成バッジ（badge_type・earned_at） |
| `otetsudai_saving_goals` | 貯金目標（目標名・目標金額・達成フラグ） |
| `otetsudai_invest_portfolios` | 投資ポートフォリオ（銘柄・株数・購入価格・現在価格・評価額） |
| `otetsudai_stock_sync_log` | 株価取得ログ（レート制限管理用） |

## コンポーネント構成（v0.5 新規・変更）

| コンポーネント | ファイル | 概要 |
| --- | --- | --- |
| RewardSplitSlider | `components/reward-split-slider.tsx` | 3分割報酬スライダー。赤/青/緑カラーバー、アイコン凡例、2本の独立スライダー（ためる・ふやす）。save + invest <= 100 の自動制約 |
| QuestSteps | `components/quest-steps.tsx` | 3ステップ構造化クエストUI。順序制約チェックリスト、習熟度バッジ（見習い/助手/リーダー）、報酬倍率表示。DOG_WALK_STEPSテンプレート付属 |
| Slider (shadcn/ui) | `components/ui/slider.tsx` | shadcn/ui スライダープリミティブ |
| AddChildDialog | `components/add-child-dialog.tsx` | 親ダッシュボードからの子供追加ダイアログ。名前+PIN入力、createChildWithWallet+set_pin_hash RPC |
| SelfQuestForm | `components/self-quest-form.tsx` | 子供がクエストを提案するダイアログ。プリセット10種プルダウン選択＋カスタム自由入力。報酬はトップダウン（親設定基準額）。スタンプ6種＋メッセージ。RLSポリシーでpending提案のみ許可 |
| LevelDisplay | `components/level-display.tsx` | 累計獲得額ベースのレベル表示。7段階ランク＋プログレスバー＋次レベルまでの残額 |
| ApprovalDialog | `components/approval-dialog.tsx` | 承認時スタンプ選択ダイアログ。8種LINE風スタンプ＋ひとことメッセージ＋プレビュー |
| StampNotifications | `components/stamp-notifications.tsx` | 子供ダッシュボードのスタンプ通知表示。最新5件のスタンプ＋メッセージ |
| PaymentLinkDialog | `components/payment-link.tsx` | 支出承認後の外部決済アプリ連携ダイアログ。PayPay/B43/LINE Payディープリンク |
| InvestPortfolio | `components/invest-portfolio.tsx` | 投資ポートフォリオ表示。銘柄別損益＋手動同期ボタン |
| MaintenanceGuard | `components/maintenance-guard.tsx` | メンテナンスモードガード。環境変数で全画面切替 |

### QuestSteps 使用例

```tsx
import QuestSteps, { DOG_WALK_STEPS } from "@/components/quest-steps";

<QuestSteps
  steps={DOG_WALK_STEPS}
  baseReward={100}
  skillLevel="apprentice"  // "assistant" | "leader"
  taskTitle="🐕 いぬの おさんぽ"
  onComplete={(reward) => handleTaskComplete(reward)}
/>
```

### RewardSplitSlider 使用例

```tsx
import RewardSplitSlider from "@/components/reward-split-slider";

<RewardSplitSlider
  saveRatio={30}
  investRatio={10}
  onChange={(save, invest) => updateRatio(save, invest)}
/>
```

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
| v0.1.1 | 2026-04-07 | タスクアイコン30種、子供画面全漢字ルビ、AIチャット（コインくん/アドバイザー）、ヘルプページ |
| v0.2 | 2026-04-07 | ランディング、サインアップ（Supabase Auth）、支出承認、分割比率UI、貯金目標、バッジ4種、コインアニメ、動的🐷、きょうやること、共通ヘッダー、PWA、DB 3テーブル追加 |
| v0.3 | 2026-04-08 | 「おこづかいクエスト」にリブランド。クエスト世界観統一（タスク→クエスト、完了→クリア）、テーマカラー変更（amber→emerald）、AIチャット全ページ化、🏆クエストマスターバッジ追加 |
| v0.4 | 2026-04-08 | セキュリティ・認証・コード基盤強化。全9テーブルRLS有効化、PIN暗号化（pgcrypto+bcrypt）、Supabase Authハイブリッドセッション、アカウント削除（soft delete）、法務ページ（プライバシーポリシー・利用規約）、lib/services/層分離 |
| v0.5 | 2026-04-08 | UD（ユニバーサルデザイン）対応・UI/UX強化。TOP画面リニューアル（ログイン済みリダイレクト・UDカラー3色フィーチャーカード）、報酬3分割スライダー（赤:つかう・青:ためる・緑:ふやす、カラーバー+アイコン二重符号化・aria対応）、クエスト構造化UI（準備→実行→完了の3ステップチェックリスト・順序制約ロック）、習熟度システム（見習い🌱x1/助手⭐x1.5/リーダー👑x2の報酬倍率）、親ダッシュボード3色ウォレット表示、大型タッチターゲット・アクセシビリティ改善 |
| v0.6 | 2026-04-09 | エージェンシー強化・外部連携・コミュニケーション設計。おこさま後追加（親ダッシュボードからいつでも子供追加可能）、じぶんクエスト（子供がクエスト提案→親が報酬調整して承認/却下、エージェンシー醸成）、レベルアップシステム（累計獲得額ベース7段階ランク＋プログレスバー）、承認スタンプ（8種LINE風スタンプ＋ひとことメッセージ→子供への通知表示）、外部決済連携（PayPay/B43/LINE Payディープリンク）、株価連動Invest（Alpha Vantage API＋Supabase Edge Function＋投資ポートフォリオテーブル）、PWA強化（maskableアイコン・shortcuts・SW v2キャッシュ戦略・Apple PWA対応）、メンテナンスモード（環境変数トグル）、DBマイグレーション3本（self_quest/approval_stamps/invest_portfolios） |
| v0.6.1 | 2026-04-09 | じぶんクエストUI改善＆RLS全面修正＆親ダッシュボード刷新。【じぶんクエスト】プルダウン選択式・報酬トップダウン化・スタンプ6種追加・メッセージ簡略化。【RLS】全テーブルにanon許可ポリシー追加・familyIdフィルタ追加。【親ダッシュボード】統計4枚カード廃止→承認待ち件数のみ強調、空状態ウェルカムカード（子供未登録・クエスト未設定・承認ゼロ）、ウォレット更新バグ修正（split_ratio→save_ratio/invest_ratio 3分割対応）、子供名のメールアドレス表示修正、ひらがな化推進。messageカラムNULLABLE化 |

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
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # アカウント削除API（Auth管理）に必要
ANTHROPIC_API_KEY=your_anthropic_api_key

# v0.6 追加（任意）
NEXT_PUBLIC_MAINTENANCE_MODE=false  # true でメンテナンスモード有効化
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key  # 株価連動機能（Supabase Edge Function用）
```

### Supabase DB セットアップ（v0.4 セキュリティ）

v0.4以降、以下のDB設定が必要です（Supabase SQL Editorで実行）:

```sql
-- 1. pgcrypto拡張を有効化（PIN暗号化用）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. pin_hashカラム追加（既存のpinカラムからの移行）
ALTER TABLE otetsudai_users ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE otetsudai_users ADD COLUMN IF NOT EXISTS auth_id UUID;

-- 3. 既存PINをbcryptハッシュに移行
UPDATE otetsudai_users
SET pin_hash = crypt(pin, gen_salt('bf'))
WHERE pin IS NOT NULL AND pin_hash IS NULL;

-- 4. PIN照合用RPC関数
CREATE OR REPLACE FUNCTION verify_pin(p_user_id UUID, p_pin TEXT)
RETURNS BOOLEAN AS $$
  SELECT pin_hash = crypt(p_pin, pin_hash)
  FROM otetsudai_users WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 5. PINハッシュ設定用RPC関数
CREATE OR REPLACE FUNCTION set_pin_hash(p_user_id UUID, p_pin TEXT)
RETURNS VOID AS $$
  UPDATE otetsudai_users
  SET pin_hash = crypt(p_pin, gen_salt('bf'))
  WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. 家族ID取得関数（RLS用）
CREATE OR REPLACE FUNCTION get_my_family_id()
RETURNS UUID AS $$
  SELECT family_id FROM otetsudai_users
  WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 7. 全テーブルにRLSを有効化し、家族単位のポリシーを設定
-- （各テーブルごとにALTER TABLE ... ENABLE ROW LEVEL SECURITY;
--   およびCREATE POLICY ... USING (family_id = get_my_family_id()); を実行）
```

### v0.6 DBマイグレーション

v0.6で追加された3つのマイグレーションを順番に実行してください:

```bash
# 1. じぶんクエスト（tasksテーブルにカラム追加）
cat supabase/migrations/20260409_self_quest.sql
# → Supabase SQL Editor で実行

# 2. 承認スタンプ（task_logsテーブルにカラム追加）
cat supabase/migrations/20260409_approval_stamps.sql
# → Supabase SQL Editor で実行

# 3. 投資ポートフォリオ（新テーブル作成）
cat supabase/migrations/20260409_invest_portfolios.sql
# → Supabase SQL Editor で実行
```
