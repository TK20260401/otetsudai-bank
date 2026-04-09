-- stock_prices テーブル拡張: カテゴリ・子供向け説明・前日比・かな名・円価格

-- 新カラム追加（既存テーブルに）
ALTER TABLE otetsudai_stock_prices
  ADD COLUMN IF NOT EXISTS name_ja TEXT,
  ADD COLUMN IF NOT EXISTS name_kana TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'us_stock',
  ADD COLUMN IF NOT EXISTS description_kids TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS price_jpy NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS change_percent NUMERIC(8,4) DEFAULT 0;

-- 既存データ更新（name_ja/name_kana/description_kids を埋める）
UPDATE otetsudai_stock_prices SET
  name_ja = 'Apple', name_kana = 'アップル', category = 'us_stock',
  description_kids = 'iPhoneを つくってる かいしゃ',
  icon = '🍎'
WHERE symbol = 'AAPL';

UPDATE otetsudai_stock_prices SET
  name_ja = 'Tesla', name_kana = 'テスラ', category = 'us_stock',
  description_kids = 'でんきじどうしゃの かいしゃ',
  icon = '🚗'
WHERE symbol = 'TSLA';

UPDATE otetsudai_stock_prices SET
  name_ja = 'Boeing', name_kana = 'ボーイング', category = 'us_stock',
  description_kids = 'ひこうきを つくってる かいしゃ',
  icon = '✈️'
WHERE symbol = 'BA';

UPDATE otetsudai_stock_prices SET
  name_ja = 'Disney', name_kana = 'ディズニー', category = 'us_stock',
  description_kids = 'ミッキーの かいしゃ',
  icon = '🏰'
WHERE symbol = 'DIS';

UPDATE otetsudai_stock_prices SET
  name_ja = '任天堂', name_kana = 'にんてんどう', category = 'jp_stock',
  description_kids = 'マリオや スイッチを つくってる',
  icon = '🎮'
WHERE symbol = '7974.T';

UPDATE otetsudai_stock_prices SET
  name_ja = 'JR東日本', name_kana = 'じぇいあーる ひがしにほん', category = 'jp_stock',
  description_kids = 'でんしゃを はしらせてる かいしゃ',
  icon = '🚂'
WHERE symbol = '9020.T';

UPDATE otetsudai_stock_prices SET
  name_ja = '明治HD', name_kana = 'めいじ', category = 'jp_stock',
  description_kids = 'チョコや おかしを つくってる',
  icon = '🍫'
WHERE symbol = '2269.T';

UPDATE otetsudai_stock_prices SET
  name_ja = 'トヨタ', name_kana = 'とよた', category = 'jp_stock',
  description_kids = 'くるまを つくってる かいしゃ',
  icon = '🚗'
WHERE symbol = '7203.T';

-- インデックス（ETF代替）追加
INSERT INTO otetsudai_stock_prices (symbol, name, name_ja, name_kana, icon, category, description_kids, currency, is_preset) VALUES
  ('1321.T', '日経225 ETF', '日経225', 'にっけい225', '🗾', 'index', 'にほんの おおきな かいしゃ 225こ', 'JPY', true),
  ('1306.T', 'TOPIX ETF', 'TOPIX', 'トピックス', '🏯', 'index', 'とうきょうの かぶ ぜんぶ', 'JPY', true),
  ('SPY', 'S&P500 ETF', 'S&P500', 'えすあんどぴー500', '🗽', 'index', 'アメリカの おおきな かいしゃ 500こ', 'USD', true),
  ('DIA', 'NYダウ ETF', 'NYダウ', 'にゅーよーく ダウ', '🏙️', 'index', 'アメリカの ゆうめいな かいしゃ 30こ', 'USD', true),
  ('QQQ', 'NASDAQ ETF', 'NASDAQ', 'ナスダック', '💻', 'index', 'テクノロジーの かいしゃが おおい', 'USD', true)
ON CONFLICT (symbol) DO UPDATE SET
  name = EXCLUDED.name,
  name_ja = EXCLUDED.name_ja,
  name_kana = EXCLUDED.name_kana,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  description_kids = EXCLUDED.description_kids;

-- Nike 追加
INSERT INTO otetsudai_stock_prices (symbol, name, name_ja, name_kana, icon, category, description_kids, currency, is_preset) VALUES
  ('NKE', 'Nike', 'Nike', 'ナイキ', '👟', 'us_stock', 'スニーカーの かいしゃ', 'USD', true)
ON CONFLICT (symbol) DO UPDATE SET
  name_ja = EXCLUDED.name_ja,
  name_kana = EXCLUDED.name_kana,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  description_kids = EXCLUDED.description_kids;
