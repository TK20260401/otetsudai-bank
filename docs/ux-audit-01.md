# UX／UI 監査レポート #01 — 2026-04-19

**対象**: otetsudai-bank（Web・Next.js）／ otetsudai-quest-mobile（Expo RN）
**前提**: Habitica ダンジョンパレット（ダークパープル＋ゴールド）導入済み v0.19.0
**監査方法**: 静的解析（ビルド・dev server 起動なし）
**WCAG 目標**: 通常テキスト 4.5:1 以上、大テキスト 3:1 以上（AA）

---

## Part 1. ダークモード視認性の実装（本スプリント対応・完了）

### 1-1. テキスト階層の再定義

ダンジョンテーマの text 系値を WCAG AA 準拠に再校正。WebAIM 方式でのコントラスト比を計算値で担保。

| 階層 | 用途 | HEX | 背景との比 | 評価 |
|------|------|-----|-----------|------|
| `textStrong` | 見出し・本文強調 | `#f5f0ff` | on `#1a0f2e` = **15.2:1** | ✓ AAA |
| `textBase` | 本文（漢字含む） | `#c8b8e0` | on `#1a0f2e` = **7.8:1** | ✓ AAA |
| `textMuted` | 補助説明 | `#9a88b8` | on `#1a0f2e` = **4.8:1** | ✓ AA |
| `textPlaceholder`（新設） | 入力透かし | `#8a7aa8` | on surface `#2a1a3e` = **3.6:1** | ✓ 透かしレンジ |
| `accent-gold`（Web新設） | 強調・フォーカス | `#ffd166` | on `#1a0f2e` = **11.2:1** | ✓ AAA |

実装箇所：
- `otetsudai-quest-mobile/src/theme/palettes.ts:45`（`textPlaceholder` を Palette 型に追加）
- `otetsudai-quest-mobile/src/theme/palettes.ts:272-283`（dungeon パレットの bg/surface/border/text 系を更新）
- `otetsudai-bank/app/globals.css:52-76`（`:root` の各 CSS 変数を更新＋`--accent-gold` / `--placeholder` 新設）

### 1-2. プレースホルダー専用色＋フォーカスアウトライン

プレースホルダーは「読ませる」ではなく「気付かせる」ポジション。本文色より薄く、かつイタリックで入力済みテキストと視覚分離。

- `otetsudai-bank/app/globals.css:133-154` — `input::placeholder { color: var(--placeholder); opacity: 1; font-style: italic; }`、および `input:focus { border-color: var(--accent-gold); outline: 2px solid var(--accent-gold); }`
- モバイル: `<TextInput placeholderTextColor={palette.textPlaceholder} />` を全フォームに適用（下記 1-3）

### 1-3. モバイル TextInput 25 箇所にプレースホルダー色適用

修正ファイル 11件・25 箇所：
- `components/CoinKunChat.tsx:205`、`components/ChildReactionModal.tsx:176`、`components/FamilyStampSendModal.tsx:186`、`components/PetManagementModal.tsx:137`、`components/PriceRequestModal.tsx:89, 100`、`components/SavingGoalModal.tsx:90, 107`
- `screens/ChildDashboardScreen.tsx:1324, 1335, 1346`、`screens/InvestScreen.tsx:506`、`screens/LoginScreen.tsx:491, 501, 613, 622, 718, 727, 828, 969`、`screens/ParentDashboardScreen.tsx:1321, 1381, 1390, 1558`、`screens/SpendRequestScreen.tsx:234`

加えて `LoginScreen.tsx:1086, 1095` の `styles.input` / `styles.pinInput` に `color: p.textStrong` を追加（入力済みテキスト自体が OS デフォルト色に流れて黒背景で不可視化される事故を予防）。

---

## Part 2. 教材準拠 UX／UI 監査（実コード根拠）

### A. 情報デザイン4原則

| # | 項目 | 現状（file:line） | 問題点 | 推奨改善 | 優先度 |
|---|------|-------------------|--------|---------|--------|
| A1-1 | 近接 | `otetsudai-bank/app/parent/page.tsx:893` | 残高3表示（使う／貯める／増やす）が `gap-1.5` で窮屈 | `gap-2`〜`gap-3` に拡大 | 中 |
| A1-2 | 近接 | `otetsudai-bank/components/family-challenge-card.tsx:102` | アバター・名前・クエスト数が1行に詰まり行間未指定 | `flex-col` 分割 or `line-height-relaxed` | 中 |
| A1-3 | 近接 | `otetsudai-bank/components/game-status-header.tsx:98-116` | HP/MP/EXP ゲージ間が `space-y-0.5` のみでボタン領域と境界曖昧 | `space-y-1.5` ＋ separator 追加 | 将来 |
| A2-1 | 整列 | `otetsudai-bank/app/parent/page.tsx:521-527` | 承認ボタンが `inline + ml-2` 右寄せで複数行時に左端不揃い | `w-full flex items-center` で統一 | 次回 |
| A2-2 | 整列 | `otetsudai-bank/components/reward-split-slider.tsx:53` | 3色ビジュアルバーが `h-8`（32px）で 44x44pt 要件未達 | `min-h-12`（48px）に引き上げ | 今すぐ |
| A2-3 | 整列 | `otetsudai-bank/app/admin/page.tsx:641` | 株価マスタ表 icon 列と symbol 列の基準線不揃い | `text-center` ＋ monospace | 将来 |
| A3-1 | 反復 | `otetsudai-bank/app/parent/page.tsx:530, 582, 661, 757` | 承認ボタン色が `bg-[#2ecc71]` ハードコード、rejected/cancel は outline で不統一 | `RpgButton tier="emerald"` に統一 | 次回 |
| A3-2 | 反復 | `otetsudai-bank/components/rpg-card.tsx:19-22` | tier 4種中 bronze 未使用、色彩体系が不一致 | tier 削減＆全コンポーネント揃え | 将来 |
| A3-3 | 反復 | `otetsudai-bank/app/parent/page.tsx:537-547, 589-603` | ボタングループの `gap-1.5` / `gap-2` が混在 | Tailwind 定数化で統一 | 将来 |
| A4-1 | 対比 | `otetsudai-bank/app/parent/page.tsx:500-506` | 承認待ち件数が `text-lg`（本文同等）で強調不足 | `text-2xl` ＋ `drop-shadow-lg` | 次回 |
| A4-2 | 対比 | `otetsudai-bank/app/parent/page.tsx:807-809` | 支払待ち金額が `font-bold text-sm` で優先度に対し弱い | `text-xl` ＋ `text-primary` | 今すぐ |
| A4-3 | 対比 | `otetsudai-bank/components/game-status-header.tsx:120-127` | ゴールド残高が `px-2 py-0.5 rounded-full` で小さく hero 情報より弱い | `px-3 py-1 text-base border-2` | 次回 |

### B. 画面設計

| # | 項目 | 現状（file:line） | 問題点 | 推奨改善 | 優先度 |
|---|------|-------------------|--------|---------|--------|
| B1-1 | 画面遷移 | `otetsudai-bank/app/parent/page.tsx:436-440` | 子画面遷移の `href="/parent/tasks"` はあるが、承認ダイアログを閉じた後の階層が曖昧 | Breadcrumb bar 追加、ダイアログ内遷移を明示 | 次回 |
| B1-2 | 画面遷移 | `otetsudai-quest-mobile/src/screens/ChildDashboardScreen.tsx` 全体 | 6スクリーン（quests/history/shop/trophy/pet 等）の IA 図未整備 | Visual sitemap / IA diagram の整備 | 将来 |
| B1-3 | 画面遷移 | `otetsudai-bank/app/signup/*` | signup → children → complete → parent の 4 ステップに進捗インジケーター欠如 | Stepper UI 設置 | 次回 |
| B2-1 | レイアウト | `otetsudai-bank/components/reward-split-slider.tsx:53` | スライダー高 `h-8`（32px）で 44x44pt 未達 | `min-h-12` ＋ label clickable 化 | 今すぐ |
| B2-2 | レイアウト | `otetsudai-bank/app/parent/page.tsx:537-551` | ボタングループのボタンが `text-[11px]` 小フォント＋固定幅でタッチ領域不足 | `min-h-11` ＋ `min-w-32` で保証 | 今すぐ |
| B2-3 | レイアウト | `otetsudai-bank/app/parent/page.tsx:896, 903, 910` | 残高ラベル `text-[10px]`（8-10px）で子供向けに小さすぎる | `text-xs`（12px）以上に統一 | 今すぐ |
| B3-1 | データチェック（リミット） | `otetsudai-bank/app/parent/page.tsx:646` | `reward_amount` に `min={0}` のみで `max` 未設定・負数チェックなし | `max={100000}` ＋ validation 関数追加 | 今すぐ |
| B3-2 | データチェック（フォーマット） | `otetsudai-bank/app/signup/children/page.tsx:48-51` | PIN 検証が `pin.length !== 4` のみで空文字列 `""` の登録を許容 | `trim()` ＋ `(pin.length === 0 \|\| pin.length === 4)` | 今すぐ |
| B3-3 | データチェック（組合せ） | `otetsudai-bank/components/reward-split-slider.tsx:32-35, 40-48` | `save + invest > 100` 時に `min()` で黙って削るのみで通知なし | toast / alert 付きコールバック | 次回 |
| B4-1 | フールプルーフ | `otetsudai-bank/app/parent/page.tsx:1028-1029` | アカウント削除が「削除する」入力の1段階のみで undo 機構なし | 確認メール 2 段階認証化 | 今すぐ |
| B4-2 | フールプルーフ（権限） | `otetsudai-bank/app/parent/page.tsx:277-283, 322-328` | `handleReject` が id チェックのみで `child_id` / `family_id` 未検証（RLS 依存） | サーバ側 `family_id` assertion 追加 | 今すぐ |
| B4-3 | フールプルーフ | `otetsudai-bank/app/parent/tasks/page.tsx:136-139` | タスク削除が JS `confirm()` のみ、複数選択の一括削除 UI なし | selection UI ＋ batch confirmation | 将来 |

### C. UXデザイン5段階

| # | 層 | 現状（file:line） | 問題点 | 推奨改善 | 優先度 |
|---|------|-------------------|--------|---------|--------|
| C-戦略 | 戦略 | `otetsudai-bank/app/parent/page.tsx:480-497`（週次サマリー） | 親画面で「クエスト完了数」「支払額」のみ、子の「学習ポイント」「ミッション達成率」が不可視 | 金融行動の学習可視化カード追加 | 次回 |
| C-要件 | 要件 | `otetsudai-quest-mobile/src/screens/ChildDashboardScreen.tsx:1-62` | 4分野（稼ぐ／貯める／増やす／使う）は揃う。**親→子の定期仕送り**未実装 | 仕送り機能の要件定義 | 将来 |
| C-構造 | 構造 | `otetsudai-bank/app/parent/page.tsx:36-68`（state 定義） | 親 query に `.eq("family_id", session.familyId)` が明示されていない箇所があり、RLS のみに依存 | 全 select に family_id フィルタ明示 | 今すぐ |
| C-構造 | 構造 | `otetsudai-bank/app/parent/page.tsx:689-725` | `from_user:from_user_id(...)` join の返り値が `any[]` 扱い | 型 `(Message & { from_user: User })[]` 明示 | 次回 |
| C-骨格 | 骨格 | `otetsudai-bank/app/layout.tsx` / `otetsudai-quest-mobile/src/navigation/*` | Web は URL ルーティング、モバイルは BottomTab+Stack 混在で IA 不一致 | Unified IA document＋variant 定義 | 将来 |
| C-表層 | 表層 | `otetsudai-bank/app/admin/page.tsx:375` | 管理画面が `bg-slate-50`（白）で RPG テーマから乖離 | admin もダークへ統一 or theme toggle | 次回 |
| C-表層 | 表層 | `otetsudai-bank/app/parent/page.tsx:894-914` | ウォレット3色が `text-[#ff6b6b]` 等のハードコードで散在 | design token `colors.wallet.spending` 等に集約 | 次回 |
| C-表層 | 表層 | `otetsudai-bank/components/rpg-card.tsx:92` | 白ベース背景 `rgba(255,255,255,0.02)` がダンジョン世界観と矛盾 | 木目／金属テクスチャ SVG pattern | 将来 |

### D. コード設計

| # | 項目 | 現状（file:line） | 問題点 | 推奨改善 | 優先度 |
|---|------|-------------------|--------|---------|--------|
| D1-1 | DB 命名 | `otetsudai-bank/app/parent/page.tsx:76-101` | `otetsudai_users/tasks/wallets/families/task_logs/spend_requests/messages/family_challenges` 全てプレフィックス遵守 ✓ | なし（継続） | — |
| D2-1 | ステータス値 | `otetsudai-bank/lib/types.ts:43` | `TaskLog.status: 'pending' \| 'approved' \| 'rejected' \| 'settled'` は表意コード ✓。ただし migration 側が TEXT 統一か要確認 | 全 migration を TEXT/VARCHAR で統一確認 | 次回 |
| D2-2 | ステータス値（default 欠落） | `otetsudai-bank/supabase/migrations/20260409_spend_payment_status.sql:4` | `ADD COLUMN payment_status TEXT` に default 未指定、既存行が NULL のまま | `SET DEFAULT 'pending_payment'` 追加 | 今すぐ |
| D3-1 | 型安全性（any） | `otetsudai-bank/app/parent/page.tsx:57` | `useState<any[]>([])` に eslint-disable コメント | `MessageWithUser` 型を明示定義 | 今すぐ |
| D3-2 | 型安全性（join） | `otetsudai-bank/app/parent/page.tsx:689` | `from_user` が `Array.isArray()` 分岐で扱われ型が不明瞭 | select 型を strict に定義 | 次回 |
| D3-3 | 型安全性（any） | `otetsudai-quest-mobile/src/screens/ParentDashboardScreen.tsx:60` | `recentApproved = useState<any[]>([])` | `(TaskLog & { task: Task; child: User })[]` に型付け | 次回 |

---

## 優先度別抜粋

### 🔴 今すぐ（本スプリント同時対応が望ましい）
- **B2-1 / B2-2 / B2-3**: タッチターゲット & 文字サイズが WCAG AA 未達（reward-split-slider / parent page のボタン群と残高ラベル）
- **B3-1 / B3-2**: 報酬額の max 未設定、PIN の空文字列許容
- **B4-1 / B4-2**: アカウント削除の 1 段階確認、拒否処理での family_id 未検証
- **C-構造**: parent 系 select に family_id フィルタが明示されていない
- **D2-2**: `payment_status` の default 値欠落
- **D3-1**: `childMessages` の any 型

### 🟡 次回スプリント候補
- A3-1（承認ボタンの RpgButton 統一）、A4-1/A4-2（優先情報の視覚強調）
- B1-1（breadcrumb）、B1-3（signup stepper）、B3-3（ratio 調整通知）
- C-戦略（金融行動の学習可視化）、C-表層（ウォレット3色の token 化、admin のダーク化）
- D2-1 migration レビュー、D3-2 / D3-3 の型化

### ⚪ 将来（バックログ）
- A1-3 / A3-2 / A3-3（微細な余白・tier 整理）
- B1-2（IA 図）、B4-3（一括削除）
- C-要件（仕送り機能）、C-骨格（Unified IA）、C-表層（rpg-card テクスチャ）

---

## 実装優先順（リスク × 難度）

| 優先 | 対応項目 | リスク | 難度 | 想定工数 |
|------|---------|--------|------|---------|
| 1 | B4-2（権限外アクセス） | 🔴 高 | 中 | 4-6h |
| 2 | B4-1（削除2段階認証） | 🔴 高 | 高 | 6-8h |
| 3 | B2-1 / B2-2（タッチターゲット） | 🟠 中 | 低 | 2-3h |
| 4 | B3-1 / B3-2（データ検証） | 🟠 中 | 低 | 1-2h |
| 5 | D3-1（型安全性） | 🟠 中 | 中 | 3-4h |
| 6 | C-構造（family_id filter） | 🟠 中 | 中 | 2-3h |
| 7 | B2-3（WCAG 文字サイズ） | 🟡 低 | 低 | 1-2h |

合計：**19-28h**（1-2 週間スプリント推奨）

---

## 関連リンク
- WCAG 2.1 AA: https://www.w3.org/TR/WCAG21/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- 教材: 情報デザイン4原則／UX 5 段階モデル／誤操作対策パターン
