-- Phase 1: 送金ステータス管理
-- 支出承認後の実送金ステータスを追跡するカラムを追加
ALTER TABLE otetsudai_spend_requests
  ADD COLUMN IF NOT EXISTS payment_status TEXT,      -- 'pending_payment' | 'paid' | null
  ADD COLUMN IF NOT EXISTS payment_method TEXT,       -- 'paypay' | 'b43' | 'linepay' | 'cash' | 'other' | null
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;       -- 送金完了日時
