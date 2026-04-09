-- 承認時スタンプ＆メッセージ
-- task_logsテーブルにスタンプとメッセージカラムを追加

ALTER TABLE otetsudai_task_logs
  ADD COLUMN IF NOT EXISTS approval_stamp TEXT,
  ADD COLUMN IF NOT EXISTS approval_message TEXT;

COMMENT ON COLUMN otetsudai_task_logs.approval_stamp IS '承認時スタンプ（絵文字キー）';
COMMENT ON COLUMN otetsudai_task_logs.approval_message IS '承認時のひとことメッセージ';
