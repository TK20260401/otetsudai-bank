-- stock_prices v3: プリセット銘柄拡充（14 → 22）
-- 追加: 日本株 4銘柄（ソニー・ファーストリテイリング・サンリオ・オリエンタルランド）
-- 追加: 米国株 4銘柄（Microsoft・Google・Amazon・McDonald's）
--
-- 前提: 20260409_stock_prices_v2.sql で追加された category / name_kana /
-- description_kids / currency / is_preset カラムが既存。
-- 本マイグレーションは INSERT のみ、既存行は変更しない。

-- ── 日本株 +4 ──────────────────────────────────
INSERT INTO otetsudai_stock_prices (symbol, name, name_ja, name_kana, icon, category, description_kids, currency, is_preset) VALUES
  ('6758.T', 'Sony Group', 'ソニー', 'そにー', '🎮', 'jp_stock', 'ゲームや カメラを つくってる', 'JPY', true),
  ('9983.T', 'Fast Retailing', 'ファーストリテイリング', 'ゆにくろ', '👕', 'jp_stock', 'ユニクロの ふくを うってる', 'JPY', true),
  ('8136.T', 'Sanrio', 'サンリオ', 'さんりお', '🎀', 'jp_stock', 'ハローキティの かいしゃ', 'JPY', true),
  ('4661.T', 'Oriental Land', 'オリエンタルランド', 'おりえんたるらんど', '🏰', 'jp_stock', 'ディズニーランドの かいしゃ', 'JPY', true)
ON CONFLICT (symbol) DO UPDATE SET
  name = EXCLUDED.name,
  name_ja = EXCLUDED.name_ja,
  name_kana = EXCLUDED.name_kana,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  description_kids = EXCLUDED.description_kids;

-- ── 米国株 +4 ──────────────────────────────────
INSERT INTO otetsudai_stock_prices (symbol, name, name_ja, name_kana, icon, category, description_kids, currency, is_preset) VALUES
  ('MSFT', 'Microsoft', 'Microsoft', 'まいくろそふと', '💻', 'us_stock', 'パソコンの Windowsを つくってる', 'USD', true),
  ('GOOGL', 'Alphabet', 'Google', 'ぐーぐる', '🔍', 'us_stock', 'けんさくや YouTubeの かいしゃ', 'USD', true),
  ('AMZN', 'Amazon', 'Amazon', 'あまぞん', '📦', 'us_stock', 'ネットしょっぴんぐの かいしゃ', 'USD', true),
  ('MCD', 'McDonald''s', 'マクドナルド', 'まくどなるど', '🍔', 'us_stock', 'ハンバーガーの かいしゃ', 'USD', true)
ON CONFLICT (symbol) DO UPDATE SET
  name = EXCLUDED.name,
  name_ja = EXCLUDED.name_ja,
  name_kana = EXCLUDED.name_kana,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  description_kids = EXCLUDED.description_kids;

-- ── 結果 ────────────────────────────────────────
-- index    : 5 銘柄（既存）
-- jp_stock : 4 + 4 = 8 銘柄
-- us_stock : 5 + 4 = 9 銘柄
-- 合計     : 22 銘柄
