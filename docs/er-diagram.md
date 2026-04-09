# おこづかいクエスト ER図・ステータス遷移図

## ER図（全テーブル）

```mermaid
erDiagram
    otetsudai_families {
        uuid id PK
        text name
        timestamptz created_at
    }

    otetsudai_users {
        uuid id PK
        uuid family_id FK
        text role "parent | child"
        text name
        text pin
        text pin_hash
        text icon
        int display_order
        uuid auth_id "Supabase Auth UID（親のみ）"
        timestamptz created_at
    }

    otetsudai_tasks {
        uuid id PK
        uuid family_id FK
        text title
        text description
        int reward_amount
        text recurrence "once | daily | weekly"
        uuid assigned_child_id FK
        boolean is_active
        text created_by
        text proposal_status "pending | approved | rejected"
        int proposed_reward
        text proposal_message
        timestamptz created_at
    }

    otetsudai_task_logs {
        uuid id PK
        uuid task_id FK
        uuid child_id FK
        text status "pending | approved | rejected | settled"
        text reject_reason
        text approval_stamp
        text approval_message
        timestamptz completed_at
        timestamptz approved_at
        uuid approved_by FK
        timestamptz settled_at
    }

    otetsudai_wallets {
        uuid id PK
        uuid child_id FK
        int spending_balance
        int saving_balance
        int invest_balance
        int save_ratio
        int invest_ratio
        int split_ratio "deprecated"
        timestamptz updated_at
    }

    otetsudai_transactions {
        uuid id PK
        uuid wallet_id FK
        text type "earn | spend | save | invest"
        int amount
        text description
        uuid task_log_id FK
        timestamptz created_at
    }

    otetsudai_spend_requests {
        uuid id PK
        uuid child_id FK
        uuid wallet_id FK
        int amount
        text purpose
        text status "pending | approved | rejected"
        text reject_reason
        text payment_status "pending_payment | paid"
        text payment_method "paypay | b43 | linepay | cash | other"
        timestamptz paid_at
        timestamptz created_at
        timestamptz approved_at
        uuid approved_by FK
    }

    otetsudai_badges {
        uuid id PK
        uuid child_id FK
        text badge_type
        timestamptz earned_at
    }

    otetsudai_saving_goals {
        uuid id PK
        uuid child_id FK
        text title
        int target_amount
        boolean is_achieved
        timestamptz created_at
    }

    otetsudai_messages {
        uuid id PK
        uuid family_id FK
        uuid from_user_id FK
        uuid to_user_id FK
        text message
        text stamp
        boolean is_read
        timestamptz created_at
    }

    otetsudai_invest_portfolios {
        uuid id PK
        uuid wallet_id FK
        uuid child_id FK
        text symbol
        text name
        numeric shares
        numeric buy_price
        numeric current_price
        int current_value
        timestamptz purchased_at
        timestamptz updated_at
        timestamptz created_at
    }

    otetsudai_stock_prices {
        uuid id PK
        text symbol
        text name
        text icon
        numeric price
        text currency "JPY | USD"
        boolean is_preset
        timestamptz updated_at
    }

    otetsudai_invest_orders {
        uuid id PK
        uuid child_id FK
        uuid wallet_id FK
        text symbol
        text name
        int amount "投資金額（円）"
        text order_type "buy | sell"
        text status "pending | approved | rejected | executed"
        numeric executed_price
        numeric executed_shares
        timestamptz created_at
        timestamptz approved_at
        uuid approved_by FK
    }

    otetsudai_stock_sync_log {
        uuid id PK
        text symbol
        numeric price
        timestamptz synced_at
    }

    otetsudai_families ||--o{ otetsudai_users : "has"
    otetsudai_families ||--o{ otetsudai_tasks : "has"
    otetsudai_families ||--o{ otetsudai_messages : "has"
    otetsudai_users ||--o| otetsudai_wallets : "has"
    otetsudai_users ||--o{ otetsudai_task_logs : "completes"
    otetsudai_users ||--o{ otetsudai_spend_requests : "requests"
    otetsudai_users ||--o{ otetsudai_badges : "earns"
    otetsudai_users ||--o{ otetsudai_saving_goals : "sets"
    otetsudai_users ||--o{ otetsudai_invest_portfolios : "owns"
    otetsudai_users ||--o{ otetsudai_invest_orders : "orders"
    otetsudai_tasks ||--o{ otetsudai_task_logs : "logged"
    otetsudai_wallets ||--o{ otetsudai_transactions : "records"
    otetsudai_wallets ||--o{ otetsudai_spend_requests : "from"
    otetsudai_wallets ||--o{ otetsudai_invest_portfolios : "holds"
    otetsudai_wallets ||--o{ otetsudai_invest_orders : "from"
    otetsudai_task_logs ||--o| otetsudai_transactions : "generates"
```

## ステータス遷移図

### クエスト完了フロー

```mermaid
stateDiagram-v2
    [*] --> pending: 子供が完了報告
    pending --> approved: 親が承認（スタンプ＋メッセージ）
    pending --> rejected: 親がやりなおし（理由付き）
    approved --> settled: ウォレット3分割加算
    settled --> [*]
    rejected --> [*]: 子供に温かいフィードバック表示
```

### 支出申請フロー

```mermaid
stateDiagram-v2
    [*] --> pending: 子供が「つかう」申請
    pending --> approved: 親が承認
    pending --> rejected: 親がやりなおし（プリセット理由）
    approved --> pending_payment: payment_status設定
    pending_payment --> paid: 親が送金完了記録（PayPay/B43/現金等）
    paid --> [*]
    rejected --> [*]: 子供にフィードバック表示
```

### クエスト提案フロー

```mermaid
stateDiagram-v2
    [*] --> proposal_pending: 子供がじぶんクエスト提案
    proposal_pending --> proposal_approved: 親が承認（報酬調整可）
    proposal_pending --> proposal_rejected: 親が「こんどにしよう」
    proposal_approved --> active: is_active=true でクエスト一覧に追加
    active --> [*]
    proposal_rejected --> [*]
```

### 投資注文フロー

```mermaid
stateDiagram-v2
    [*] --> pending: 子供が「かいたい！」申請
    pending --> approved: 親が承認
    pending --> rejected: 親がやりなおし
    approved --> executed: invest_balanceから減算＋ポートフォリオ記録
    executed --> [*]: 子供のポートフォリオに表示
    rejected --> [*]
```

## 報酬の遷移（ライフサイクル）

```
┌─────────────────────────────────────────────────────────┐
│                    報酬のライフサイクル                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  クエスト完了(pending)                                    │
│       │                                                 │
│       ├──→ 親承認(approved) ──→ 3分割加算                │
│       │         │                                       │
│       │         ├──→ 💰つかう(spending_balance)          │
│       │         │         │                             │
│       │         │         └──→ 支出申請 → 親承認         │
│       │         │                   → 送金待ち → 送金済み │
│       │         │                                       │
│       │         ├──→ 🐷ためる(saving_balance)            │
│       │         │         │                             │
│       │         │         └──→ 貯金目標の進捗に反映       │
│       │         │                                       │
│       │         └──→ 🌱ふやす(invest_balance)            │
│       │                   │                             │
│       │                   └──→ 投資注文 → 親承認         │
│       │                             → ポートフォリオ記録  │
│       │                             → 株価同期で評価額更新 │
│       │                                                 │
│       └──→ やりなおし(rejected)                          │
│                   → 子供にフィードバック                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
