-- 親子メッセージテーブル（おねがいボード）
-- 子供→親、親→子供の双方向メッセージ

CREATE TABLE IF NOT EXISTS otetsudai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES otetsudai_families(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES otetsudai_users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES otetsudai_users(id) ON DELETE CASCADE,  -- NULLなら家族全員宛
  message TEXT NOT NULL,
  stamp TEXT,          -- スタンプ（絵文字キー）
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE otetsudai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "メッセージ参照" ON otetsudai_messages
  FOR SELECT USING (true);

CREATE POLICY "メッセージ挿入" ON otetsudai_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "メッセージ更新" ON otetsudai_messages
  FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_messages_family ON otetsudai_messages(family_id);
CREATE INDEX IF NOT EXISTS idx_messages_to ON otetsudai_messages(to_user_id);
