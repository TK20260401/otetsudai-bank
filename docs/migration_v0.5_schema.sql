-- ============================================================
-- おてつだい銀行 v0.5 — DBスキーマ設計書
-- 適用済み: 2026-04-08
-- マイグレーション名: extend_profiles_wallets_task_status
-- ============================================================
--
-- 設計方針:
--   1. 認証: 1 Supabase Auth ID = 1 家族 (otetsudai_families)
--   2. プロファイル: otetsudai_users に icon/display_order 追加
--      → Netflix風プロファイル選択画面で使用
--   3. ウォレット: Spend/Save/Invest の3分割
--      → save_ratio + invest_ratio <= 100, spend = 残り
--   4. タスクステータス: pending → approved → settled (+ rejected)
--   5. RLS: get_my_family_id() ベースの家族内アクセス制御
--
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. プロファイル拡張
-- ──────────────────────────────────────────────
ALTER TABLE otetsudai_users
  ADD COLUMN IF NOT EXISTS icon text DEFAULT '👤',
  ADD COLUMN IF NOT EXISTS display_order int DEFAULT 0;

-- ──────────────────────────────────────────────
-- 2. 3ウォレット (Spend / Save / Invest)
-- ──────────────────────────────────────────────
ALTER TABLE otetsudai_wallets
  ADD COLUMN IF NOT EXISTS invest_balance integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS save_ratio integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS invest_ratio integer NOT NULL DEFAULT 20;

ALTER TABLE otetsudai_wallets
  ADD CONSTRAINT wallets_invest_balance_gte_0 CHECK (invest_balance >= 0),
  ADD CONSTRAINT wallets_ratio_sum_lte_100 CHECK (save_ratio + invest_ratio <= 100),
  ADD CONSTRAINT wallets_save_ratio_range CHECK (save_ratio >= 0 AND save_ratio <= 100),
  ADD CONSTRAINT wallets_invest_ratio_range CHECK (invest_ratio >= 0 AND invest_ratio <= 100);

-- 振り分け計算:
--   earn 100円, save_ratio=50, invest_ratio=20 の場合
--   → save=50, invest=20, spend=30

-- ──────────────────────────────────────────────
-- 3. トランザクション: invest タイプ追加
-- ──────────────────────────────────────────────
ALTER TABLE otetsudai_transactions
  DROP CONSTRAINT IF EXISTS otetsudai_transactions_type_check;
ALTER TABLE otetsudai_transactions
  ADD CONSTRAINT otetsudai_transactions_type_check
  CHECK (type = ANY (ARRAY['earn','spend','save','invest']));

-- ──────────────────────────────────────────────
-- 4. タスクログ: 3段階ステータス
--    pending  = 子が完了報告
--    approved = 親が内容確認（中間ステータス、必要に応じて使用）
--    settled  = 決済完了（ウォレット反映済み）
--    rejected = 差し戻し
-- ──────────────────────────────────────────────
ALTER TABLE otetsudai_task_logs
  DROP CONSTRAINT IF EXISTS otetsudai_task_logs_status_check;
ALTER TABLE otetsudai_task_logs
  ADD CONSTRAINT otetsudai_task_logs_status_check
  CHECK (status = ANY (ARRAY['pending','approved','rejected','settled']));

ALTER TABLE otetsudai_task_logs
  ADD COLUMN IF NOT EXISTS settled_at timestamptz;

-- ──────────────────────────────────────────────
-- 5. child_profiles ビュー
-- ──────────────────────────────────────────────
CREATE OR REPLACE VIEW child_profiles AS
SELECT
  u.id,
  u.family_id,
  u.name,
  u.icon,
  u.display_order,
  u.pin_hash,
  u.created_at,
  w.id AS wallet_id,
  w.spending_balance,
  w.saving_balance,
  w.invest_balance,
  w.save_ratio,
  w.invest_ratio,
  (100 - w.save_ratio - w.invest_ratio) AS spend_ratio
FROM otetsudai_users u
LEFT JOIN otetsudai_wallets w ON w.child_id = u.id
WHERE u.role = 'child';

-- ──────────────────────────────────────────────
-- 6. add_child_profile() — 子プロファイル動的追加
-- ──────────────────────────────────────────────
-- 呼び出し例:
--   SELECT add_child_profile('family-uuid', '太郎', '🧒', 50, 20);
-- 戻り値:
--   {"child_id": "...", "wallet_id": "...", "name": "太郎",
--    "icon": "🧒", "save_ratio": 50, "invest_ratio": 20, "spend_ratio": 30}
--
CREATE OR REPLACE FUNCTION add_child_profile(
  p_family_id uuid,
  p_name text,
  p_icon text DEFAULT '👦',
  p_save_ratio integer DEFAULT 50,
  p_invest_ratio integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_child_id uuid;
  v_wallet_id uuid;
  v_display_order int;
BEGIN
  SELECT COALESCE(MAX(display_order), 0) + 1
    INTO v_display_order
    FROM otetsudai_users
   WHERE family_id = p_family_id AND role = 'child';

  INSERT INTO otetsudai_users (family_id, role, name, icon, display_order)
  VALUES (p_family_id, 'child', p_name, p_icon, v_display_order)
  RETURNING id INTO v_child_id;

  INSERT INTO otetsudai_wallets (child_id, spending_balance, saving_balance, invest_balance, save_ratio, invest_ratio)
  VALUES (v_child_id, 0, 0, 0, p_save_ratio, p_invest_ratio)
  RETURNING id INTO v_wallet_id;

  RETURN jsonb_build_object(
    'child_id', v_child_id,
    'wallet_id', v_wallet_id,
    'name', p_name,
    'icon', p_icon,
    'save_ratio', p_save_ratio,
    'invest_ratio', p_invest_ratio,
    'spend_ratio', 100 - p_save_ratio - p_invest_ratio
  );
END;
$$;

-- ──────────────────────────────────────────────
-- 7. settle_task_reward() — 承認→3ウォレット分配
-- ──────────────────────────────────────────────
-- 呼び出し例:
--   SELECT settle_task_reward('task-log-uuid', 'parent-user-uuid');
--
CREATE OR REPLACE FUNCTION settle_task_reward(
  p_task_log_id uuid,
  p_approved_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log record;
  v_task record;
  v_wallet record;
  v_spend_amount integer;
  v_save_amount integer;
  v_invest_amount integer;
BEGIN
  SELECT * INTO v_log FROM otetsudai_task_logs WHERE id = p_task_log_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task log not found: %', p_task_log_id;
  END IF;
  IF v_log.status != 'pending' THEN
    RAISE EXCEPTION 'Task log is not pending: status=%', v_log.status;
  END IF;

  SELECT * INTO v_task FROM otetsudai_tasks WHERE id = v_log.task_id;
  SELECT * INTO v_wallet FROM otetsudai_wallets WHERE child_id = v_log.child_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for child: %', v_log.child_id;
  END IF;

  v_save_amount   := FLOOR(v_task.reward_amount * v_wallet.save_ratio / 100.0);
  v_invest_amount := FLOOR(v_task.reward_amount * v_wallet.invest_ratio / 100.0);
  v_spend_amount  := v_task.reward_amount - v_save_amount - v_invest_amount;

  UPDATE otetsudai_task_logs
     SET status = 'settled',
         approved_at = now(),
         approved_by = p_approved_by,
         settled_at = now()
   WHERE id = p_task_log_id;

  UPDATE otetsudai_wallets
     SET spending_balance = spending_balance + v_spend_amount,
         saving_balance   = saving_balance + v_save_amount,
         invest_balance   = invest_balance + v_invest_amount,
         updated_at = now()
   WHERE id = v_wallet.id;

  IF v_spend_amount > 0 THEN
    INSERT INTO otetsudai_transactions (wallet_id, type, amount, description, task_log_id)
    VALUES (v_wallet.id, 'earn', v_spend_amount, v_task.title || '（つかう）', p_task_log_id);
  END IF;
  IF v_save_amount > 0 THEN
    INSERT INTO otetsudai_transactions (wallet_id, type, amount, description, task_log_id)
    VALUES (v_wallet.id, 'save', v_save_amount, v_task.title || '（ためる）', p_task_log_id);
  END IF;
  IF v_invest_amount > 0 THEN
    INSERT INTO otetsudai_transactions (wallet_id, type, amount, description, task_log_id)
    VALUES (v_wallet.id, 'invest', v_invest_amount, v_task.title || '（ふやす）', p_task_log_id);
  END IF;

  RETURN jsonb_build_object(
    'task_log_id', p_task_log_id,
    'reward', v_task.reward_amount,
    'spend', v_spend_amount,
    'save', v_save_amount,
    'invest', v_invest_amount,
    'new_spending_balance', v_wallet.spending_balance + v_spend_amount,
    'new_saving_balance', v_wallet.saving_balance + v_save_amount,
    'new_invest_balance', v_wallet.invest_balance + v_invest_amount
  );
END;
$$;

-- ──────────────────────────────────────────────
-- ER図（テキスト）
-- ──────────────────────────────────────────────
--
--  auth.users (Supabase Auth)
--       │ 1
--       │
--       ▼ 1
--  otetsudai_families ──────────┐
--       │ 1                     │
--       │                       │
--       ▼ N                     ▼ N
--  otetsudai_users          otetsudai_tasks
--   (parent/child)            │ 1
--   │ 1     │ 1               │
--   │       │                 ▼ N
--   │       │         otetsudai_task_logs
--   │       │          (pending→settled)
--   │       ▼ 1               │
--   │  otetsudai_wallets      │
--   │   (spend/save/invest)   │
--   │       │ 1               │
--   │       ▼ N               │
--   │  otetsudai_transactions◄┘
--   │
--   ├──▶ otetsudai_badges
--   ├──▶ otetsudai_saving_goals
--   └──▶ otetsudai_spend_requests
--
-- ──────────────────────────────────────────────
