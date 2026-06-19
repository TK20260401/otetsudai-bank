-- otetsudai_family_messages: スタンプ／メッセージのいずれか一方でも送信可能にする
-- 症状: スタンプだけ／メッセージだけでの送信が失敗するケースに備える防御
-- どちらか必須は CHECK 制約で担保（両方 NULL は禁止）

ALTER TABLE otetsudai_family_messages
  ALTER COLUMN stamp_id DROP NOT NULL;

ALTER TABLE otetsudai_family_messages
  ALTER COLUMN message DROP NOT NULL;

ALTER TABLE otetsudai_family_messages
  DROP CONSTRAINT IF EXISTS family_messages_stamp_or_message_required;

ALTER TABLE otetsudai_family_messages
  ADD CONSTRAINT family_messages_stamp_or_message_required
  CHECK (
    stamp_id IS NOT NULL
    OR (message IS NOT NULL AND length(trim(message)) > 0)
  );
