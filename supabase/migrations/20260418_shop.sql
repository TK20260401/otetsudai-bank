-- ショップ: 称号（タイトル）の購入・装備
CREATE TABLE IF NOT EXISTS otetsudai_shop_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES otetsudai_users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  is_equipped boolean NOT NULL DEFAULT false,
  UNIQUE (child_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_child ON otetsudai_shop_purchases (child_id);
CREATE INDEX IF NOT EXISTS idx_shop_equipped ON otetsudai_shop_purchases (child_id, is_equipped) WHERE is_equipped = true;

ALTER TABLE otetsudai_shop_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop_purchases_select" ON otetsudai_shop_purchases FOR SELECT USING (true);
CREATE POLICY "shop_purchases_insert" ON otetsudai_shop_purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "shop_purchases_update" ON otetsudai_shop_purchases FOR UPDATE USING (true);
