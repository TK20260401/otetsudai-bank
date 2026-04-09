-- 投資ポートフォリオテーブル
-- Investウォレットの内訳を管理し、Edge Function(stock-sync)で株価と同期する

CREATE TABLE IF NOT EXISTS otetsudai_invest_portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES otetsudai_wallets(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES otetsudai_users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,              -- 銘柄コード（例: 7203.T = トヨタ）
  name TEXT NOT NULL,                -- 銘柄名（例: トヨタ自動車）
  shares NUMERIC(12,4) NOT NULL DEFAULT 0,  -- 保有株数（端株対応）
  buy_price NUMERIC(12,2) NOT NULL,  -- 購入時単価
  current_price NUMERIC(12,2),       -- 最新株価（stock-syncで更新）
  current_value INTEGER DEFAULT 0,   -- 現在評価額（円）
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE otetsudai_invest_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "投資ポートフォリオ参照" ON otetsudai_invest_portfolios
  FOR SELECT USING (true);

CREATE POLICY "投資ポートフォリオ挿入" ON otetsudai_invest_portfolios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "投資ポートフォリオ更新" ON otetsudai_invest_portfolios
  FOR UPDATE USING (true);

-- 株価取得ログ（レート制限管理用）
CREATE TABLE IF NOT EXISTS otetsudai_stock_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_invest_portfolios_wallet ON otetsudai_invest_portfolios(wallet_id);
CREATE INDEX IF NOT EXISTS idx_invest_portfolios_child ON otetsudai_invest_portfolios(child_id);
