-- 既存ウォレットの NULL フィールドをデフォルト値でバックフィル
-- 次郎のように新規追加された子のウォレットが不完全だった問題の修正

UPDATE otetsudai_wallets
SET
  invest_balance = COALESCE(invest_balance, 0),
  save_ratio = COALESCE(save_ratio, 20),
  invest_ratio = COALESCE(invest_ratio, 10)
WHERE
  invest_balance IS NULL
  OR save_ratio IS NULL
  OR invest_ratio IS NULL;

-- 将来の新規作成時のため、DEFAULTを設定
ALTER TABLE otetsudai_wallets
  ALTER COLUMN invest_balance SET DEFAULT 0,
  ALTER COLUMN save_ratio SET DEFAULT 20,
  ALTER COLUMN invest_ratio SET DEFAULT 10;
