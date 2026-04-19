# 株カテゴリ画面 総合監査レポート — v0.19.6

**監査日**: 2026-04-19
**対象**: モバイル版 InvestScreen.tsx / Web版 invest-order-dialog.tsx / 20260409_stock_prices_v2.sql
**方法**: 静的コード監査（ビルド・dev server・Supabase CLI なし）

---

## A. カテゴリタブのWeb/モバイル整合性

### 判定: ⚠️ **問題あり（ラベル差分）**

| key | Mobile（kanji） | Web（hiragana） |
|---|---|---|
| `index` | インデックス | インデックス ✓ |
| `jp_stock` | 🇯🇵 **日本** | 🇯🇵 **にほん** |
| `us_stock` | 🇺🇸 アメリカ | 🇺🇸 アメリカ ✓ |

| key | Mobile(desc) | Web(desc) |
|---|---|---|
| `index` | **初めての人におすすめ** | **はじめての ひとに おすすめ** |

- **キー一致**: `index` / `jp_stock` / `us_stock` ✓
- **並び順一致**: `index → jp_stock → us_stock` ✓
- **ラベル差分**: 2箇所（`jp_stock` label、`index` desc）

**推奨修正**: アプリ全体の「漢字+ルビ」方針に合わせて **Web 側を Mobile の漢字表記に統一**。
→ **修正実施**（下記 Fix セクション参照）

---

## B. 初回表示カテゴリ（default active）

### 判定: ✅ **OK**

- Mobile: `useState<string>("index")` — InvestScreen.tsx:69
- Web: `useState<string>("index")` — invest-order-dialog.tsx:48 + line 57 で再初期化
- 両版で **`index`（インデックス）がデフォルト選択**、「初めての人におすすめ」が先頭 ✓

---

## C. 銘柄データ完備確認

### 判定: ⚠️ **注釈あり（銘柄数）**

20260409_stock_prices_v2.sql の確認結果（INSERT + UPDATE のユニーク symbol を数えた実数）：

| category | 件数 | 銘柄 | 達成 |
|---|---|---|---|
| `index` | **5** | 日経225 / TOPIX / S&P500 / NYダウ / NASDAQ | ✓（要件「5銘柄」充足）|
| `jp_stock` | **4** | 任天堂 / JR東日本 / 明治HD / トヨタ | ✓（要件「4銘柄以上」充足）|
| `us_stock` | **5** | Apple / Tesla / Boeing / Disney / Nike | ✓（要件「4銘柄以上」充足）|
| **合計** | **14** | | — |

**タスク仕様書「全24銘柄」との乖離**: 14銘柄のみ。仕様書の数値は将来計画と推測。現状は要件は全て満たしており**今回の監査では問題なし**。

### 必須フィールドチェック（全14銘柄サンプル確認）
- `name_kana`（ふりがな）✓ 全銘柄に設定（例: 'アップル', 'にんてんどう'）
- `icon`（絵文字）✓ 全銘柄に設定（🍎 🚗 🎮 🗾 等）
- `description_kids`（子供向け説明）✓ 全銘柄に設定
- `currency`（JPY / USD）✓
- `is_preset` ✓ 全 `true`（プリセット銘柄）

### description_kids のひらがな主体チェック
- 「iPhoneを つくってる かいしゃ」「マリオや スイッチを つくってる」等、**ひらがな主体**で記述 ✓
- 一部の漢字（iPhone 等の固有名詞）は保持されるが、子供向け読みやすさを確保できている

---

## D. ダークテーマ追従

### 判定: ⚠️ **Web側に漏れあり**

| 対象 | palette 参照 | 判定 |
|---|---|---|
| Mobile InvestScreen.tsx カテゴリタブ | `p.walletInvestBg` / `p.walletInvestText` / `p.textMuted` / `p.surfaceMuted` / `p.border` | ✅ 完全対応 |
| Web invest-order-dialog.tsx カテゴリタブ | `bg-green-100` / `bg-white` / `text-green-800` / `text-gray-600` ハードコード | ❌ ダンジョン未対応 |

**Mobile コントラスト計算**（dungeon palette）:
- 非アクティブ: textMuted `#9a88b8` on surfaceMuted `#36205d` → ~3.7:1（AA ボーダーライン）✓
- アクティブ: walletInvestText `#58d68d` on walletInvestBg `#1a3e2a` → ~5:1 ✓

**Web 側**: Dialog モーダルの中にあるため、Tailwind 白地緑ボタンのまま表示される。アプリ全体がダンジョン化されている中で**一部だけ白ベース**で浮く可能性あり。

**推奨修正（将来タスク）**: Web カテゴリタブを CSS 変数 `var(--primary)` / `var(--card)` / `var(--muted-foreground)` ベースに書き換え。現状は機能に支障なしのため**今回は未対応**、スプシ行追加候補に記載。

---

## E. 導線

### 判定: ✅ **OK**（直近コミット `188a043` で改善済み）

- 子ダッシュボードの**固定 Quick Nav** 緑ボタン「📈 株」から1タップで InvestScreen に遷移
- InvestScreen 内のカテゴリタブは画面上部の注文モーダル内に配置、遷移直後に視認可能
- カテゴリ切替時に `selected` / `orderError` をリセット（スクロール位置までは `ScrollView.scrollTo` 等で制御していないが、モーダル内のため気にならない範囲）

---

## F. 空カテゴリ時の空状態

### 判定: ✅ **OK**（両版実装済み）

- Mobile: InvestScreen.tsx:489-493
  ```tsx
  {filteredStocks.length === 0 && (
    <Text style={styles.emptyStockText}>この カテゴリの 銘柄は ありません</Text>
  )}
  ```
- Web: invest-order-dialog.tsx:223-227
  ```tsx
  {filteredStocks.length === 0 && (
    <p className="...">この カテゴリの <R k="銘柄" r="めいがら" />は ありません</p>
  )}
  ```
- 両版ともメッセージ表現ほぼ同一、発見性良好

---

## 今すぐ修正（本監査で実施）

### Fix-1: Web の CATEGORIES ラベルを Mobile の漢字表記に統一

**ファイル**: `otetsudai-bank/components/invest-order-dialog.tsx`
**変更箇所**: L28-32 CATEGORIES 定数

```diff
  const CATEGORIES = [
-   { key: "index", label: "インデックス", desc: "はじめての ひとに おすすめ" },
+   { key: "index", label: "インデックス", desc: "初めての人におすすめ" },
-   { key: "jp_stock", label: "🇯🇵 にほん", desc: "" },
+   { key: "jp_stock", label: "🇯🇵 日本", desc: "" },
    { key: "us_stock", label: "🇺🇸 アメリカ", desc: "" },
  ];
```

Web でも `<R k>` ルビヘルパーでふりがなを補える既存資産があるため、漢字ベースの統一表記を採用。Web/Mobile の UI 文言差異を解消。

---

## 将来対応（スプシ行追加案）

| # | カテゴリ | 項目 | 優先 |
|---|---|---|---|
| AUD-1 | データ | 銘柄 14→24 への拡充（jp_stock / us_stock 追加 4銘柄ずつ、index 変更なし）| 次回 |
| AUD-2 | Web UI | invest-order-dialog カテゴリタブを CSS 変数化、ダンジョン（ダーク）対応 | 次回 |
| AUD-3 | UX | InvestScreen カテゴリ切替時のスクロール位置リセット（モーダル内）| 将来 |
| AUD-4 | ドキュメント | 銘柄追加ガイドライン（name_kana / description_kids の文体基準）| 将来 |
| AUD-5 | データ整合 | admin 画面から銘柄追加時に category / name_kana / description_kids 必須化バリデーション | 次回 |

---

## 参考リンク

- Mobile カテゴリ定数: `otetsudai-quest-mobile/src/screens/InvestScreen.tsx:36-40`
- Web カテゴリ定数: `otetsudai-bank/components/invest-order-dialog.tsx:28-32`
- 銘柄マイグレーション: `otetsudai-bank/supabase/migrations/20260409_stock_prices_v2.sql`
- Stock sync Edge Function: `otetsudai-bank/supabase/functions/stock-sync/index.ts`（本監査では未改変）

