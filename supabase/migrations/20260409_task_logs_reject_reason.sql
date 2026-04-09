-- クエスト差し戻し理由カラムを追加（「やりなおし」フィードバック用）
ALTER TABLE otetsudai_task_logs ADD COLUMN IF NOT EXISTS reject_reason TEXT;
