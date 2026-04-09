-- Phase 2: 投資シミュレーション

-- 株価プリセットテーブル
CREATE TABLE IF NOT EXISTS otetsudai_stock_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  price NUMERIC(12,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_preset BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE otetsudai_stock_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_prices_select" ON otetsudai_stock_prices FOR SELECT USING (true);
CREATE POLICY "stock_prices_update" ON otetsudai_stock_prices FOR UPDATE USING (true);

-- プリセット銘柄
INSERT INTO otetsudai_stock_prices (symbol, name, icon, currency) VALUES
  ('AAPL', 'Apple', '🍎', 'USD'),
  ('TSLA', 'Tesla', '🚗', 'USD'),
  ('BA', 'Boeing', '✈️', 'USD'),
  ('DIS', 'Disney', '🧸', 'USD'),
  ('7974.T', '任天堂', '🎮', 'JPY'),
  ('9020.T', 'JR東日本', '🚂', 'JPY'),
  ('2269.T', '明治HD', '🍫', 'JPY'),
  ('7203.T', 'トヨタ', '🚗', 'JPY')
ON CONFLICT (symbol) DO NOTHING;

-- 投資注文テーブル
CREATE TABLE IF NOT EXISTS otetsudai_invest_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES otetsudai_users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES otetsudai_wallets(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,         -- 投資金額（円）
  order_type TEXT NOT NULL DEFAULT 'buy',   -- buy | sell
  status TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected | executed
  executed_price NUMERIC(12,2),    -- 約定時の株価
  executed_shares NUMERIC(12,6),   -- 約定株数
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID
);

ALTER TABLE otetsudai_invest_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invest_orders_select" ON otetsudai_invest_orders FOR SELECT USING (true);
CREATE POLICY "invest_orders_insert" ON otetsudai_invest_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "invest_orders_update" ON otetsudai_invest_orders FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_invest_orders_child ON otetsudai_invest_orders(child_id);
