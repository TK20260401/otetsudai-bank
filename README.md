# おこづかいクエスト — お手伝い＝クエスト！マネー冒険アプリ（v0.21.0）

## 概要

**お手伝い＝クエスト。子供が冒険感覚でお手伝いをこなし、「稼ぐ・貯める・増やす・使う」を体験できる家族向けマネー教育アプリ。**

日本の家庭の「お手伝い」文化をベースに、タスク達成→報酬→バッジのゲーミフィケーションで子供が労働の対価・貯金・支出管理を自然に学べる。米国の「BusyKid」にインスパイアされた、完全日本語対応の教育フィンテックアプリ。

## ビジョン・教育理念

### 目指す世界

「**自走する世界市民（シチズンシップ）**」の育成。単なるお小遣い帳ではなく、子供が主体的に経済活動を体験し、お金の価値・労働の対価・貯蓄と投資の意味を実感として理解できるプラットフォーム。

### 3つの教育柱

| 柱 | 概念 | アプリでの実現 |
| --- | --- | --- |
| エージェンシー（自己主導性） | 子供が自ら意思決定し行動する力 | じぶんクエスト提案、貯金目標設定、支出申請 |
| 金融リテラシー | お金の稼ぎ方・使い方・増やし方 | 3分割ウォレット（つかう・ためる・ふやす）、投資シミュレーション |
| デジタルシチズンシップ | デジタル社会での責任ある行動 | 親承認制、PIN認証、プライバシー教育 |

### トップダウンとボトムアップのバランス

| 要素 | トップダウン（親の権限） | ボトムアップ（子供の主体性） |
| --- | --- | --- |
| クエスト設計 | 親がクエスト・報酬額を設定 | 子供がじぶんクエストを提案 |
| 報酬管理 | 親が分割比率を設定 | 子供が貯金目標を設定 |
| 支出管理 | 親が承認/やりなおし | 子供が用途を自分で説明して申請 |
| フィードバック | 親がスタンプ・メッセージで褒める | 子供がスタンプで気持ちを伝える |

### 対象ユーザー

| 対象 | 年齢 | 想定される使い方 |
| --- | --- | --- |
| 未就学児（年中〜年長） | 4〜6歳 | 親の補助付きでスタンプ操作、ひらがなUI |
| 小学校低学年 | 6〜9歳 | クエスト完了報告、貯金目標設定 |
| 小学校高学年 | 9〜12歳 | じぶんクエスト提案、支出申請、投資シミュレーション |
| 特別支援学校中学部 | 〜15歳 | UD対応UI、構造化クエスト、大型タッチターゲット |
| 特別支援学級・通級指導 | 〜15歳 | 個別のペースに合わせた段階的な利用 |

## 競合アプリ比較

### 海外の主要サービス

| アプリ | 国 | 特徴 | カード | 投資 | 日本語 | 料金 |
| --- | --- | --- | --- | --- | --- | --- |
| BusyKid | 米国 | お手伝い管理+Visaカード+株式投資 | Visa | 実株 | x | $19/年 |
| Greenlight | 米国 | 子供用デビットカード+投資機能 | Mastercard | 実株 | x | $5.99/月〜 |
| GoHenry | 英国 | 子供用カード+教育コンテンツ | Visa | x | x | $3.99/月〜 |
| Step | 米国 | Z世代向け無料Visaカード | Visa | x | x | 無料 |
| Acorns Early | 米国 | おつり投資+子供口座 | x | ETF | x | $5/月〜 |
| RoosterMoney | 英国 | お手伝い管理特化 | x | x | x | 無料〜 |

### 日本国内

| アプリ | 特徴 | 課題 |
| --- | --- | --- |
| ファミリーバンク | 親子でお小遣い管理 | 投資機能なし、認知度低め |
| ゆうちょ通帳アプリ | シンプルな貯金管理 | お手伝い連動なし |
| iAllowance | お小遣い管理（買い切り） | 英語ベース |

### おこづかいクエストの差別化

| 機能 | BusyKid | Greenlight | GoHenry | おこづかいクエスト |
| --- | --- | --- | --- | --- |
| お手伝い管理 | o | o | o | o |
| 報酬3分割（使う/貯める/増やす） | o | o | x | o |
| 投資体験 | 実株 | 実株 | x | シミュレーション |
| 日本語完全対応 | x | x | x | o（ふりがな付き） |
| ユニバーサルデザイン | x | x | x | o（色+アイコン二重符号化） |
| 特別支援教育対応 | x | x | x | o（構造化UI・大型ターゲット） |
| AIアドバイザー | x | x | x | o（Claude API） |
| RPGゲーミフィケーション | x | x | x | o（クエスト・レベル・バッジ） |
| 料金 | $19/年 | $5.99/月 | $3.99/月 | 無料（OSS） |

**日本語対応で「お手伝い x 投資」を組み合わせたアプリはブルーオーシャン。**

## リアルマネー連携ロードマップ

### 3段階アプローチ

```
Phase 1（現在）   → アプリ内仮想残高 + 手動送金リンク
Phase 2（半年〜） → プリペイドカード連携（B/43 Jr等）※法人化必要
Phase 3（1年〜）  → 銀行API直結 ※資金移動業ライセンス必要
```

### Phase 1: 仮想残高 + 手動送金（現在の実装）

```
子供がクエスト完了 → 親が承認 → アプリ内残高に加算（仮想）
                                  |
                    子供が「つかう」申請 → 親が承認
                                  |
                    親が手動でPayPay/現金/B43で渡す
                                  |
                    親が「おしはらいずみ」ボタンで記録
```

- 法的リスクゼロで最も現実的
- BusyKid初期版もこの方式
- 送金ステータス管理（pending_payment→paid）実装済み

### Phase 2: プリペイドカード連携（法人化後）

| サービス | API | 個人開発 |
| --- | --- | --- |
| B/43ジュニア | API非公開 | x |
| PayPay | 送金APIは法人のみ | x |
| Kyash | API非公開 | x |
| LINE Pay | 送金APIは法人のみ | x |
| GMOあおぞらネット銀行 | sunabar（sandbox有） | 法人口座必要 |

**現状、日本で個人開発者が使える「子供向け送金API」は存在しない。法人化が前提条件。**

### Phase 3: 銀行API直結

```
必要なもの:
├── 法人格（株式会社 or 合同会社）
├── 資金移動業登録（財務局への届出）
├── 銀行API契約（GMOあおぞら等）
├── 本人確認（eKYC）の実装
└── セキュリティ監査

コスト目安: 法人設立〜ライセンス取得で100-300万円 + 数ヶ月
```

### 投資機能の段階

| 段階 | 難易度 | 現実性 | 実装状況 |
| --- | --- | --- | --- |
| 株価表示のみ（Alpha Vantage） | 低 | 今すぐ可能 | Edge Function作成済み |
| シミュレーション投資（仮想売買） | 中 | 今すぐ可能 | ポートフォリオテーブル作成済み |
| 実際の株購入（証券API） | 極めて高 | 金商法の壁 | 将来構想 |

実際の株購入を代行するには**第一種金融商品取引業の登録**が必要（個人では不可能に近い）。

現実的アプローチ:
```
子供が「この株ほしい！」→ 親が承認
→ 親のSBI/楽天証券アプリへのリンクを表示
→ 親が自分の口座で購入
→ アプリ上では「投資残高」として記録（管理用）
```

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
| ユニバーサルデザイン | 色+アイコンの二重符号化、大型タッチターゲット、aria対応 |
| 教育的フィードバック | 「拒否」ではなく「やりなおし」、プリセット理由で温かい差し戻し |
| 送金ステータス管理 | 仮想残高と実送金のギャップを「おしはらいまち→ずみ」で可視化 |

## 機能一覧

| 機能 | 内容 |
| --- | --- |
| ランディングページ | クエスト世界観のアプリ紹介。常にTOP表示（ログイン済みでもリダイレクトなし）。UDカラー3色（赤:つかう・青:ためる・緑:ふやす）のフィーチャーカード。TOP→ログイン→家族選択の段階的遷移 |
| サインアップ | メール+PW→Supabase Auth→家族名→子供アカウント1〜5名（PIN説明付き） |
| ログイン | 家族選択→メンバー→PIN認証（PIN説明テキスト付き） |
| クエスト管理（親） | クエストCRUD（名前・説明・報酬・繰り返し・担当）、絵カード30種自動割当 |
| 親ダッシュボード | 承認キュー最優先（クエスト完了・支出・提案・メッセージ）、空状態ウェルカムカード、子供残高3色表示、UD対応分配スライダー、おしはらいまちセクション |
| 支出承認 | 子供「つかう」申請→親承認/やりなおし（プリセット理由付き→子供にフィードバック表示） |
| 送金ステータス管理 | 支出承認→送金待ち（pending_payment）→送金完了（paid）。PayPay/B43/LINE Pay/現金/その他の送金方法記録。子供側に送金待ち・送金済み表示 |
| 報酬3分割スライダー | 親が子供ごとに「つかう・ためる・ふやす」の比率をスライダーで設定。赤/青/緑のカラーバーで視覚化。save_ratio + invest_ratio で制御 |
| 子供ダッシュボード | 動的貯金箱、きょうのクエスト、クエストリスト、取引履歴、送金ステータス、やりなおしフィードバック |
| クエスト構造化UI | 「準備→実行→完了」の3ステップチェックリスト形式。順序制約。習熟度（見習い x1 / 助手 x1.5 / リーダー x2）による報酬倍率 |
| 貯金目標 | 子供が目標名+金額を設定、進捗バー、達成時演出 |
| 達成バッジ | はじめてのクエスト / 3日れんぞく / 1000円たっせい / ちょきんマスター / クエストマスター |
| コインアニメーション | クエストクリア時の演出 |
| AIチャット（全ページ） | 子供向け「コインくん」/ 親向け「クエストアドバイザー」/ 未ログイン「クエストガイド」 |
| ふりがな | 子供画面の全漢字にルビ自動付与 |
| ヘルプ | 3ステップガイド、子供/親向け説明、FAQ |
| PWA | manifest.json対応（standalone・テーマカラー#059669）、Service Worker、maskableアイコン、shortcuts |
| RLSセキュリティ | 全テーブルにRow Level Security有効化。PIN認証ベースのためanon許可ポリシー併設。アプリ側でsession.familyIdフィルタ |
| PIN暗号化 | pgcrypto拡張によるbcryptハッシュ保存（verify_pin/set_pin_hash RPC関数） |
| アカウント削除 | 親ダッシュボードからsoft delete（確認テキスト入力必須）、Supabase Auth連携削除 |
| 法務ページ | プライバシーポリシー（/privacy）、利用規約（/terms） |
| おこさま後追加 | 親ダッシュボードからいつでも子供を追加可能（最大5名） |
| じぶんクエスト | プリセット10種プルダウン+カスタム自由入力。報酬はトップダウン（親設定基準額）。スタンプ6種+メッセージ付き提案→親が承認 |
| レベルアップ | 累計獲得額に基づく7段階ランク。プログレスバー付き |
| 承認スタンプ | 親が承認時にLINE風スタンプ（8種）+ひとことメッセージを送信。子供に通知表示 |
| やりなおしUI | 「拒否/却下」→「やりなおし」に統一。プリセット理由でワンタップ差し戻し。子供側に温かいフィードバック |
| 外部決済連携 | 支出承認後にPayPay/B43/LINE Payへのディープリンク起動ダイアログ |
| 株価連動Invest | Alpha Vantage API連携のSupabase Edge Function。投資ポートフォリオテーブル+フロントエンド表示 |
| メンテナンスモード | DB設定ベースのメンテナンスモード。admin画面からON/OFF切替、カスタムメッセージ、終了予定時刻。adminロールは常にアクセス可。30秒キャッシュ |
| お知らせ配信 | admin画面からお知らせ作成・編集・削除。対象ロール指定（全員/親/子）、優先度3段階（通常/重要/緊急）、有効期限、ON/OFF切替。親・子画面にバナー表示（既読管理付き） |
| 株価マスター管理 | admin画面から銘柄CRUD・一括価格更新。Alpha Vantage API連携、レート制限対策（13秒間隔）、USD/JPY為替換算、プログレス表示 |
| メール認証 | サインアップ時にSupabase Auth確認メール送信。認証コールバック（/auth/confirm）、ログイン画面に認証完了/エラーバナー表示。パスワード最低8文字 |
| 登録完了画面 | サインアップ完了後の確認画面（/signup/complete）。登録サマリー+メール認証案内+セキュリティ説明 |

## ステータス遷移

### クエスト完了フロー

```
子供が完了報告 → pending（しょうにんまち）
  → 親が承認 → approved → ウォレット3分割加算
  → 親がやりなおし → rejected（理由付きフィードバック）
```

### 支出申請フロー

```
子供が「つかう」申請 → pending（しんせいちゅう）
  → 親が承認 → approved + payment_status='pending_payment'（おしはらいまち）
    → 親が送金完了記録 → payment_status='paid'（おしはらいずみ）
  → 親がやりなおし → rejected（理由付きフィードバック）
```

### クエスト提案フロー

```
子供がじぶんクエスト提案 → proposal_status='pending'
  → 親が承認（報酬調整可） → proposal_status='approved', is_active=true
  → 親が「こんどにしよう」 → proposal_status='rejected'
```

## ユニバーサルデザイン（UD）設計方針

| 手法 | 適用箇所 | 効果 |
| --- | --- | --- |
| 色+アイコンの二重符号化 | 全画面（赤:つかう / 青:ためる / 緑:ふやす） | 色覚特性に関わらず意味を伝達 |
| 大型タッチターゲット | TOP画面ボタン、クエストステップボタン | 子供の小さな指でも操作しやすい |
| aria-label / aria-hidden | 装飾アイコン・操作ボタンすべて | スクリーンリーダー対応 |
| 順序制約の視覚表現 | クエスト構造化UI（ロック+透過+disabled） | 次に何をすべきか一目でわかる |
| プログレスバー | クエストステップ、貯金目標 | 進捗を直感的に把握 |
| カラーバーによる比率可視化 | 報酬分配スライダー | 数字が読めなくても配分を理解可能 |
| ひらがな多用 | 操作ラベル・フィードバック文 | 漢字が読めない子供への配慮 |
| やさしい言葉選び | 「拒否」→「やりなおし」 | 否定的な表現を避けた教育的配慮 |

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

## DBテーブル（Supabase / 15テーブル）

| テーブル | 用途 |
| --- | --- |
| otetsudai_families | 家族マスター |
| otetsudai_users | ユーザー（parent/child、PIN、Supabase Auth連携） |
| otetsudai_tasks | クエスト定義（報酬額・繰り返し・担当・提案ステータス） |
| otetsudai_task_logs | クエスト完了ログ（pending→approved/rejected、承認スタンプ、やりなおし理由） |
| otetsudai_wallets | 子供別ウォレット（spending/saving/invest残高・save_ratio/invest_ratio分配比率） |
| otetsudai_transactions | 取引履歴（earn/spend/save/invest） |
| otetsudai_spend_requests | 支出申請（金額・用途・承認/やりなおし・送金ステータス・送金方法） |
| otetsudai_badges | 達成バッジ（badge_type・earned_at） |
| otetsudai_saving_goals | 貯金目標（目標名・目標金額・達成フラグ） |
| otetsudai_messages | 子供→親メッセージ（スタンプ・テキスト・既読管理） |
| otetsudai_stock_prices | 株価プリセット（銘柄名・カテゴリ・子供向け説明・円価格・前日比、index/jp/us分類） |
| otetsudai_invest_orders | 投資注文（銘柄・金額・注文種別・約定価格/株数） |
| otetsudai_invest_portfolios | 投資ポートフォリオ（銘柄・株数・購入価格・現在価格・評価額） |
| otetsudai_stock_sync_log | 株価取得ログ（レート制限管理用） |
| otetsudai_announcements | お知らせ（タイトル・本文・対象ロール・優先度・有効期限・作成者） |
| otetsudai_settings | 汎用設定KVストア（メンテナンスモード等） |

## コンポーネント構成

| コンポーネント | ファイル | 概要 |
| --- | --- | --- |
| RewardSplitSlider | components/reward-split-slider.tsx | 3分割報酬スライダー。赤/青/緑カラーバー、アイコン凡例 |
| QuestSteps | components/quest-steps.tsx | 3ステップ構造化クエストUI。順序制約チェックリスト、習熟度バッジ |
| AddChildDialog | components/add-child-dialog.tsx | 親ダッシュボードからの子供追加ダイアログ |
| SelfQuestForm | components/self-quest-form.tsx | 子供がクエストを提案するダイアログ。プリセット10種+カスタム |
| LevelDisplay | components/level-display.tsx | 累計獲得額ベースのレベル表示。7段階ランク+プログレスバー |
| ApprovalDialog | components/approval-dialog.tsx | 承認時スタンプ選択ダイアログ。8種LINE風スタンプ |
| StampNotifications | components/stamp-notifications.tsx | 子供ダッシュボードのスタンプ通知表示 |
| PaymentLinkDialog | components/payment-link.tsx | 支出承認後の外部決済アプリ連携ダイアログ |
| InvestPortfolio | components/invest-portfolio.tsx | 投資ポートフォリオ表示。銘柄別損益+同期ボタン |
| InvestOrderDialog | components/invest-order-dialog.tsx | 投資注文ダイアログ。プリセット8銘柄選択+金額入力 |
| MaintenanceGuard | components/maintenance-guard.tsx | メンテナンスモードガード |
| CoinAnimation | components/coin-animation.tsx | クエストクリア時のコインアニメーション |
| BadgeDisplay | components/badge-display.tsx | 達成バッジ表示 |
| SavingGoal | components/saving-goal.tsx | 貯金目標設定・進捗表示 |

## 技術スタック

| Technology | Version | Purpose |
| --- | --- | --- |
| Next.js (App Router) | 16.2.2 | フレームワーク |
| React | 19.2.4 | UI構築 |
| Tailwind CSS | 4.x | スタイリング |
| shadcn/ui | 4.1.2 | UIコンポーネント |
| Supabase | 2.x | DB（PostgreSQL）・Auth・Edge Functions |
| Anthropic Claude API | claude-sonnet-4-20250514 | AIチャット（3ロール対応） |
| Alpha Vantage API | — | 株価データ取得（無料枠25リクエスト/日） |
| TypeScript | 5.x | 型安全 |
| Vercel | — | ホスティング・CI/CD |

## 認証構造（3ロール体制）

```
admin: Supabase Auth (email/password) → otetsudai_users (role='admin', family_id=NULL)
       ログイン画面の「管理者ログイン」→ メール+PW認証 → /admin

parent/child: 家族ベース認証
1つの Supabase Auth ID (email/password)
  └── 1つの otetsudai_families
       ├── 1 parent (otetsudai_users, role='parent')
       └── N children (otetsudai_users, role='child', PIN認証)

ログイン後、プロファイル選択画面でメンバーを選択（Netflix方式）
親: Supabase Auth + localStorage session
子供: PIN認証 + localStorage session（Supabase Auth未使用）
```

## バージョン履歴

| Version | Date | Changes |
| --- | --- | --- |
| v0.1 | 2026-04-07 | 初期構築。ログイン、親ダッシュボード、タスク管理、子供ダッシュボード、ウォレット自動分配、Supabase DB 6テーブル |
| v0.1.1 | 2026-04-07 | タスクアイコン30種、子供画面全漢字ルビ、AIチャット（コインくん/アドバイザー）、ヘルプページ |
| v0.2 | 2026-04-07 | ランディング、サインアップ（Supabase Auth）、支出承認、分割比率UI、貯金目標、バッジ4種、コインアニメ、動的貯金箱、PWA、DB 3テーブル追加 |
| v0.3 | 2026-04-08 | 「おこづかいクエスト」にリブランド。クエスト世界観統一、テーマカラー変更（amber→emerald）、AIチャット全ページ化 |
| v0.4 | 2026-04-08 | セキュリティ基盤。全9テーブルRLS有効化、PIN暗号化（pgcrypto+bcrypt）、アカウント削除、法務ページ、lib/services/層分離 |
| v0.5 | 2026-04-08 | UD対応・UI/UX強化。報酬3分割スライダー、クエスト構造化UI、習熟度システム、親ダッシュボード3色ウォレット |
| v0.6 | 2026-04-09 | エージェンシー強化。おこさま後追加、じぶんクエスト、レベルアップ、承認スタンプ、外部決済連携、株価連動Invest、PWA強化、メンテナンスモード |
| v0.6.1 | 2026-04-09 | 全面改善。じぶんクエストUI改善、RLS全面修正、親ダッシュボード刷新（統計廃止・空状態・ウォレット3分割バグ修正）、やりなおしUI（教育的配慮）、送金ステータス管理（Phase 1実装） |
| v0.7 | 2026-04-09 | 法務・運用強化。利用規約全面リニューアル（免責事項強調表示・ロードマップ開示・投資シミュレーション免責）、プライバシーポリシー強化（収集/非収集データ明記・Cookie方針・COPPA配慮）、フッターリンク追加、開発用家族削除機能（NEXT_PUBLIC_DEV_MODE制御・カスケード完全削除API） |
| v0.7.1 | 2026-04-09 | 投資シミュレーション大幅拡充。インデックス(ETF)5銘柄追加（日経225/TOPIX/S&P500/NYダウ/NASDAQ）、個別株Nike追加、カテゴリタブUI（インデックス/日本株/米国株）、子供向け説明・前日比表示、stock-sync Edge Function完全書き直し（USD/JPY換算・レート制限対応）、APIプロキシ/api/stock-sync新設、最新価格ボタン修正（ローディング/エラー/5分クールダウン） |
| v0.7.2 | 2026-04-09 | 品質改善。最新価格ボタンDB直読み化（GET）で高速化、銘柄10種追加（計24銘柄）、利用規約/プライバシーに「選択肢のパラドックス」教育設計根拠追記、ルビ辞書追加（拭/箸）、ルビ位置ずれ修正（text-0.55em+leading-none）、株価同期エラーハンドリング強化（res.ok事前チェック） |
| v0.7.3 | 2026-04-09 | テストフライト対応。ルビ辞書に「手伝」追加、「目標をきめる」ボタンのルビ起因ベースラインずれ修正（inline-flex items-baseline）、投資ポートフォリオ空状態に教育メッセージ追加（長期保有の基本・選択肢のパラドックス子供向け解説）、山田家以外の家族を常時削除可能に変更（IS_DEV_MODE廃止） |
| v0.7.4 | 2026-04-10 | 家族削除修正・TOP常時ランディング化。RLS全テーブルDELETEポリシー追加、invest_portfolios参照削除、ランディングページのログイン済み自動リダイレクト廃止（常にTOP表示）、Server Component化 |
| v0.8.0 | 2026-04-10 | adminロール追加（3ロール体制）。管理者ログイン（Supabase Auth メール+PW認証）、管理者ダッシュボード（統計・家族一覧・削除）、DB制約更新（role='admin'追加・family_id NULL許容） |
| v0.9.0 | 2026-04-10 | admin機能3点実装。お知らせ配信（CRUD・優先度3段階・対象ロール指定・バナー表示・既読管理）、メンテナンスモード（DB設定ベース・admin除外・30秒キャッシュ・確認ダイアログ）、株価マスター管理（銘柄CRUD・Alpha Vantage 1銘柄ずつ同期・プログレス表示・為替換算）。DBテーブル追加: otetsudai_announcements, otetsudai_settings |
| v0.9.1 | 2026-04-10 | セキュリティ強化。メール認証（Supabase Auth Confirm email）、登録完了画面（/signup/complete）、メール認証コールバック（/auth/confirm）、パスワード最低8文字化、ログイン画面に認証ステータスバナー、adminアカウント作成 |
| v0.9.2 | 2026-04-14 | ルビ（振り仮名）レイアウト崩れ修正。globals.cssにruby/rtグローバルスタイル追加（line-height:1.75で行高均一化、ruby-align/ruby-position最適化）、ruby-text.tsxのインラインクラス重複削除 |
| v0.9.3 | 2026-04-14 | レベルシステム漢字化＋ルビ振り対応。levels.tsの全テキストをマーカー記法（[漢字｜よみ]）に変換、RubyStrコンポーネント追加（PWA/モバイル両対応）、level-display.tsx・LevelUpModal.tsx・ChildDashboardScreen.tsxをルビ表示に更新 |
| v0.9.4 | 2026-04-14 | 表記統一。全画面のひらがな表記（つかう/ためる/ふやす/ちょきん/あんしょうばんごう等）を漢字＋ルビに統一、表記ブレ解消。対象: reward-split-slider、parent/page、signup/children、add-child-dialog、chat-widget、help/page |
| v0.9.5 | 2026-04-14 | 子どもダッシュボード画面構成統一。新規追加した子（次郎）のウォレットに invest_balance / save_ratio / invest_ratio が未設定だった問題を修正。createChildWithWallet と signup/children に3分割フィールド追加、子画面の投資セクション条件撤去で常時表示、おさいふ表示を3分割（使う/貯める/増やす）に統一、NULL安全対応。既存データのバックフィルSQL追加。モバイル版の null 安全性強化 |
| v0.9.6 | 2026-04-14 | 特別クエスト・装備セクションを全児童デフォルト表示化。空状態UI追加（未獲得スロット・メッセージ）。特別クエストのassigned_child_id NULL統一バックフィル。family_settings初期行自動作成をcreateFamilyに追加 |
| v0.9.7 | 2026-04-14 | ルビ表示全面見直し。`<ruby>/<rt>`をspan+CSS（inline-block+absolute positioning）に置き換えiOS WebViewのruby display model問題を回避。ルビが漢字の真上・中央揃えで安定表示。ベースライン維持（波打ち解消）。ボタン・バッジ等ルビ含む枠に`:has(.ruby-w)`でpadding-top追加しはみ出し防止 |
| v0.9.8 | 2026-04-15 | ルビをネイティブ`<ruby>/<rt>`要素に戻し漢字との位置ズレ解消。親画面は全て漢字表示（ルビ除去）。ヘッダー「クエストマスター」を縦横画面とも1行表示に修正 |
| v0.9.9 | 2026-04-15 | ウェルカムボーナス（新規登録時100円付与+トランザクション記録）。週次サマリーカード（今週のクエスト数・稼いだ金額）をWeb/モバイル両版に追加。親画面ひらがな→漢字統一（お支払い・追加・承認等）。モバイル版ルビ間隔修正 |
| v0.10.0 | 2026-04-15 | テーマ切替UI追加。子供ダッシュボードヘッダーに3パレット（そよかぜ/やさしい森/わくわく冒険）の切替ボタン。AsyncStorageで永続化 |
| v0.10.1 | 2026-04-15 | 連続クエストストリーク（🔥）をWeb/モバイル両版に追加。親ダッシュボードに週次家族サマリー。ログインエラーをカード形式で視認性向上 |
| v0.10.2 | 2026-04-15 | Web版親ダッシュボードに週次サマリーカード追加。クエストクリア時の励ましメッセージ8種に拡充＋漢字化。ランディングページにストリーク・レベルアップ・装備コレクション訴求セクション追加 |
| v0.10.3 | 2026-04-16 | デザイン一貫性改善。dead code(colors.ts)削除、テーマボタンをパレット参照+タッチターゲット拡大、モーダルオーバーレイ/入力フィールド/ボタンスタイル統一、fontWeight統一(bold)、親カードシャドウ追加、全画面インラインスタイルをStyleSheet移行。Web版に週次サマリー・日付表示追加 |
| v0.11.0 | 2026-04-16 | モバイル版: ルビ根本修正（tightStyle）、親画面ルビ全解除、reducedMotion対応、スキルツリーUI、じぶんクエスト提案機能（子→親） |
| v0.12.0 | 2026-04-16 | TestFlightフィードバック#1対応。モバイル版: 投資画面新規追加、貯金目標バリデーション、useFocusEffectフリーズ修正、カレンダーspinner化、ルビ距離修正(iOS marginTop:-2)、辞書大量追加、DB description_kids漢字化、💰→🪙統一、画面縦固定、ログイン親子分離、新規登録、フォームアイコン統一 |
| v0.12.0 | 2026-04-16 | Web版: 貯金目標バリデーション、💰→🪙統一、ログインモード選択UI、フォームアイコン統一、報酬直接編集 |
| v0.12.3 | 2026-04-17 | 家族管理削除機能、RLSポリシー追加(admin用)、AppAlertプレーンText化、辞書「下→した」削除(誤変換防止)、バッジラベル漢字化 |
| v0.13.0 | 2026-04-17 | ファミリースタンプリレー（親⇔子・兄弟間エール送信、パーティチャット風UI）、ふやすの木（投資残高に応じた木成長メタファー: たね→ふたば→わかぎ→たいぼく）。RLSセキュリティ修正（4テーブル有効化） |
| v0.14.0 | 2026-04-17 | 月次レポート（子供ごとの成長統計+自動コメント）、ファミリーダッシュボード（冒険の地図）、家族チャレンジウィーク（協力型週間目標+進捗バー+達成ボーナス） |
| v0.15.0 | 2026-04-17 | Habitica風ピクセルアートSVG全画面導入。PixelIcons(38種)+PixelHeroSvg(戦士・魔法使い)をモバイル・Web両版に追加。全UIアイコンをSVGピクセルアートに置換 |
| v0.16.0 | 2026-04-18 | RPG演出強化。CharacterSvg(7段階レベルキャラ)・MoneyTree SVG(4段階成長)をWeb版に移植、LevelUpModal/BadgeUnlockModalのSVG化(ピクセルスパークル・メダルフレーム・RPGバナー)、FamilyChallengeCardにボスモンスターSVG、FamilyAdventureMapにワールドマップ背景SVG、クエストクリアバナーRPG化、Web版LevelDisplayにCharacterSvg+RPG風EXPバー導入。TestFlightフィードバック#1全項目完了確認+ドキュメント同期 |
| v0.18.0 | 2026-04-18 | Habitica風ペットシステム。クエストクリア時20%で卵ドロップ→3クエストで孵化→餌やり成長(baby→child→adult)。6種のペット(竜/鳳凰/ユニコーン/猫/犬/うさぎ)×4成長段階のピクセルアートSVG。幸福度システム(3日減衰)、アクティブペット切替、卵ドロップ演出。DBテーブル(otetsudai_pets)+RLS+ペットロジック(lib/pets.ts) |
| v0.17.0 | 2026-04-18 | Habitica風リッチRPG SVG全面実装。アイテムSVG基盤(金銀銅貨・宝石3色・鍵・宝袋)、RPGクエストカードフレーム(bronze/silver/gold 3段階装飾ボーダー)、HP/MP/EXPゲージ(3色RPGステータスバー)、装備ステータス表示(ATK/DEF/LCK)、宝箱オープン演出、バトルシーン+小モンスター4種(スライム/コウモリ/ゴブリン/キノコ)、RPG報酬シーケンス(バトル→宝箱→獲得表示)、ダンジョンフロア進行マップ(ボス/宝物/通常フロア)。全8機能をモバイル・Web両版で同時実装。RPGステータス算出ロジック(rpg-stats.ts)追加 |
| v0.19.0 | 2026-04-18 | Habitica風ダークテーマ完全移行+優先度C機能+絵文字全SVG化。**ダーク化**: ダンジョンパレット(#1f0f31ダークパープル+#ffa623ゴールド)を全画面に適用、RpgCard/RpgButton/GameStatusHeader両版新設、ハードコード白背景(p.white/#fff/bg-white/text-slate-*等)を全トークン化。**優先度C**: PetManagementモーダル(名前変更・アクティブ切替)、トロフィーケース(バッジ一覧・シルエット・獲得日時)、デイリーログインボーナス(7日サイクル5〜50円・wallet取得後自動起動)、ショップ(称号8種・装備表示・キャラ横バッジ)。**親画面UI**: クエスト・承認・値上げ・提案・最近承認の全カードをQuestCardFrame(bronze/silver/gold)でSVG枠化、子画面と一貫性確保。**絵文字→SVG化**: PixelIcons.tsx に22種新規追加(犬/猫/風呂/皿/ほうき/ベッド/車/シャツ/靴/花/鍋/ランドセル/歯ブラシ/トロフィー/ショップ/肉球/洗濯/スポンジ/窓/トイレ/家族/リサイクル)、TaskIconSvg新設(タスク名→SVG自動マッピング)、Parent/Child Dashboardの🪙/🧒/✏️/⏳/📝/🎁/🏆/🏪/🐾を全てPixelIcon化、モーダルヘッダーもSVG化。**子ども選択刷新**: 8種emoji picker→ChildCharacterSvg 3択(男の子/女の子/どちらでもない、6x8ピクセルアート、Habitica方針準拠の中性デザイン含む)、DBはキー保存(boy/girl/other)+legacy emoji resolver。**認証・ナビ**: こどもモード「だれかな？」に親口座非表示(role=child フィルタ)でPIN試行事故防止、起動時セッション自動ログイン廃止(QR起動時も必ずLanding経由)、GameStatusHeaderに「🏠TOP」戻るボタン追加(両版・枠線付き視認性UP)。**インフラ**: Supabase migration 3本実行済(otetsudai_daily_logins/otetsudai_shop_purchases/otetsudai_pets)、Vercel自動デプロイ反映、Web signup/complete/terms/privacy/help/adminのlight色をCSS変数に |
| v0.19.1 | 2026-04-19 | **ダークモード視認性改善（WCAG AA 準拠）**: ダンジョンパレットのテキスト階層を再校正（textStrong #f5f0ff=15.2:1 / textBase #c8b8e0=7.8:1 / textMuted #9a88b8=4.8:1）、プレースホルダー専用色 `textPlaceholder` #8a7aa8（surface 比 3.6:1 の透かしレンジ）を Palette 型に新設。Web側は `globals.css` に `--accent-gold` / `--placeholder` 変数追加＋`input::placeholder` にイタリック・opacity:1 適用・`input:focus` にゴールドアウトライン。モバイルは TextInput 25 箇所に `placeholderTextColor={palette.textPlaceholder}` を統一適用（LoginScreen 含む 11 ファイル）、`styles.input`/`pinInput` に `color: p.textStrong` を補完（入力済みテキスト不可視化の予防）。**UX監査ドキュメント**: `otetsudai-bank/docs/ux-audit-01.md` を新規作成、情報デザイン4原則／画面設計／UX 5段階／コード設計の4軸で計 30 件の指摘を file:line 付きで列挙、優先度「今すぐ／次回／将来」で分類 |
| v0.19.6 | 2026-04-19 | **株カテゴリ画面 総合監査**: `otetsudai-bank/docs/stock-category-audit.md` を新規作成。Mobile の `InvestScreen.CATEGORIES` と Web の `invest-order-dialog.CATEGORIES` を対照し、key（index/jp_stock/us_stock）と並びは一致だが Web 側ラベル（「🇯🇵 にほん」「はじめての ひとに おすすめ」）が Mobile（「🇯🇵 日本」「初めての人におすすめ」）と乖離していた差分を検出。アプリ全体の漢字+ルビ方針に合わせて **Web 側を Mobile 表記に統一修正**。20260409_stock_prices_v2.sql の実銘柄数 14（index 5 / jp_stock 4 / us_stock 5）を確認、全銘柄に name_kana・icon・description_kids・currency・is_preset 設定あり。銘柄 24 への拡充・Web タブの CSS 変数化（ダンジョン対応）は将来タスク AUD-1〜5 として記載 |
| v0.21.0 | 2026-04-20 | **SVGアニメーション全面導入＋残アニメ4点完了**。**共通基盤**: IdleAnimationWrapper(CSS keyframes 8種: bob/breathe/sway/bounce/flutter/pulse/spin/flicker)＋AnimatedValue(数値カウントアップ+ゴールドシマー)を新設、`prefers-reduced-motion`完全対応。**W1 ウォレット残高アニメ**: GameStatusHeaderのゴールド表示をAnimatedValueに置換、残高変動時にカウントアップ＋シマーエフェクト。HP/MP/EXPゲージにbarFillアニメーション(scaleX 600ms ease-out)追加。**P1 ペットアイドルアニメ**: PetSvgにstage別アニメ(egg=pulse/baby=bounce/child=bob/adult=breathe)、happiness<30で速度半減。**E1 卵孵化演出強化**: EggDropAnimationにcrackフェーズ追加(振動→6破片バースト→ペットSVG spring reveal)、テキストを「{ペット名}が うまれた！」に変更。**W2 貯金目標達成アニメ**: SavingGoalMilestone新設(fill→burst→banner 3フェーズ、紙吹雪＋spring文字)。**SVGアイドルアニメ全適用**: pixel-monster-svg(slime=bob/bat=flutter/goblin=sway/mushroom=breathe)、character-svg(sway+blink)、pixel-hero-svg(breathe)、PixelIcons 5種(coin=spin/flame=flicker/star=pulse/hourglass=spin/confetti=flutter)、PixelItemIcons 6種(コイン=spin/宝石=pulse)、money-tree(葉flutter＋実pulse)。全18コンポーネント(Web9+Mobile9)にanimated propを追加。モバイル版同時対応(React Native Animated API＋useReducedMotion) |
| v0.20.0 | 2026-04-19 | **大規模 UX/a11y 改善バッチ**。**漢字+ルビ化**: 子画面 / 値上げリクエスト / 自分クエスト提案モーダル全面で hiragana→漢字+ルビ 変換、`RubyText noWrap` prop で 1行強制＋adjustsFontSizeToFit 自動縮小、`RubyPlaceholderInput` 新設で TextInput placeholder にも漢字+ルビを可能化（オーバーレイ実装）。**スタンプ SVG 化**: `StampSvg` 新設で親エール/承認/子返信 計22 IDを既存 PixelIcon 群にマッピング、4表示箇所（FamilyMessageCard・FamilyStampSendModal・ChildReactionModal・ChildDashboard stampNotifs）を emoji→SVG に置換。**漢字視認性根本修正**: `QuestCardFrame.content` の `backgroundColor: "#FFFFFF"` ハードコードを `palette.surface` に変更、同様に `ChildDashboard` 他 9 箇所の `p.white` → `p.surface` 一括置換（白地に白文字で漢字が透かし化する問題の真犯人を退治）。**投資画面導線復活＋Quick Nav**: 子ダッシュ最上部に固定 `QuickNav 3ボタン`（🛒買いもの/🐷貯金/📈株）を配置、各ボタンは大サイズ（88px min-height）＋飽和背景色＋白ボーダー＋影で「ボタンだと一目で分かる」設計、`wallet?.id` fallback で未ロードでも遷移可能。InvestScreen では初回訪問時（ポートフォリオ空）に銘柄一覧モーダルを自動オープン、カテゴリタブ（インデックス/日本/アメリカ）と銘柄リストが即視認。戻るボタンはゴールド primaryLight 背景＋太枠＋minHeight 48 で押しやすく、「株を買いたい！」ボタンは白文字→黒文字（緑地 3:1→7:1 コントラスト改善）＋ accent 太枠＋強い影で視認性強化。**銘柄拡充**: `20260419_stock_prices_v3.sql` 新規マイグレーションで +8 銘柄（ソニー/ユニクロ/サンリオ/オリエンタルランド/Microsoft/Google/Amazon/McDonald's）、14→22 銘柄に拡充（ AUD-1 対応）。**SVG a11y**: `PixelGrid` に `label` prop 追加、`accessible + accessibilityRole="image"` で VoiceOver/TalkBack 対応、PixelIcons 64 種に個別日本語 alt ラベル（コイン・犬・花・本等）付与。**アニメ演出**: `src/components/animations/` 新設、Q1 `CoinBurstAnimation`（クエスト完了時 12 枚コイン放射状burst）・L1 `LevelUpBurst`（3層 radial ring + LEVEL UP! spring bounce + 白フラッシュ）を実装、RN 標準 Animated API + `AccessibilityInfo.isReduceMotionEnabled()` 尊重。**その他**: GameStatusHeader「TOP」→「もどる」統一、プライバシー/利用規約タイトル 1行化（`whitespace-nowrap truncate`）、だれかな？名前枠はみ出し修正（flex 1+adjustsFontSizeToFit）、ローディングひらがな「よみこみちゅう」/「ぼうけんのじゅんびちゅう」等を漢字+ルビに、家族チャレンジランダムタイトルを漢字化（`家族で力を合わせよう！`等）、Ruby.tsx に `noWrap` prop 追加＋baseColor fallback（ダーク移行時の漢字色沈み予防）、`shapeRendering` prop（react-native-svg 非対応）削除で render error 修正。**監査**: `docs/ux-audit-01.md`（情報デザイン4原則/画面設計/UX5段階/コード設計の30項目）と `docs/stock-category-audit.md`（株カテゴリ監査）を作成。備考: 22銘柄拡充 SQL の本番反映は Supabase ダッシュボード経由で別途実行必要 |

## Getting Started

```bash
cd otetsudai-bank
npm install
npm run dev
```

.env.local に以下の環境変数が必要:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# v0.6 追加（任意）
NEXT_PUBLIC_MAINTENANCE_MODE=false
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

## 参考資料

- [BusyKid紹介ニュース](https://x.com/siron93/status/2040447744360186214) — 米国のお手伝い管理アプリ。Visaカード+実株投資
- [Greenlight](https://greenlight.com/) — 子供用デビットカード。SNSで「子供が株を買う」ビジュアルがバズる
- [GoHenry](https://www.gohenry.com/) — 英国発。教育コンテンツ重視
- [GMOあおぞらネット銀行 sunabar](https://sunabar.gmo-aozora.com/) — 日本の銀行API sandbox（法人口座必要）

## ライセンス

MIT License
