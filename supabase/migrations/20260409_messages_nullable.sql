-- メッセージ本文をnullable化（スタンプのみ送信に対応）
ALTER TABLE otetsudai_messages ALTER COLUMN message DROP NOT NULL;
