-- じぶんクエスト: 子供がクエストを提案できる機能
-- created_by: 誰が作ったか（parent = 親が作成、child_id = 子供が提案）
-- proposal_status: 提案の承認状態

ALTER TABLE otetsudai_tasks
  ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'parent',
  ADD COLUMN IF NOT EXISTS proposal_status TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS proposed_reward INTEGER,
  ADD COLUMN IF NOT EXISTS proposal_message TEXT;

-- 既存タスクはすべて親が作成・承認済み
UPDATE otetsudai_tasks
  SET created_by = 'parent', proposal_status = 'approved'
  WHERE created_by IS NULL OR proposal_status IS NULL;

COMMENT ON COLUMN otetsudai_tasks.created_by IS '作成者: "parent" または 子供のuser_id';
COMMENT ON COLUMN otetsudai_tasks.proposal_status IS '提案ステータス: pending/approved/rejected';
COMMENT ON COLUMN otetsudai_tasks.proposed_reward IS '子供が提案した報酬額（親が調整前）';
COMMENT ON COLUMN otetsudai_tasks.proposal_message IS '子供からの提案メッセージ';
