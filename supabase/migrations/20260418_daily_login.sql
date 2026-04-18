-- デイリーログインボーナス: 毎日初回起動で少額報酬、連続でボーナスアップ
CREATE TABLE IF NOT EXISTS otetsudai_daily_logins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES otetsudai_users(id) ON DELETE CASCADE,
  last_login_date date NOT NULL,
  current_streak integer NOT NULL DEFAULT 1,
  longest_streak integer NOT NULL DEFAULT 1,
  total_bonus_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (child_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_logins_child ON otetsudai_daily_logins (child_id);

ALTER TABLE otetsudai_daily_logins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_logins_select" ON otetsudai_daily_logins FOR SELECT USING (true);
CREATE POLICY "daily_logins_insert" ON otetsudai_daily_logins FOR INSERT WITH CHECK (true);
CREATE POLICY "daily_logins_update" ON otetsudai_daily_logins FOR UPDATE USING (true);
