-- 子供（未認証ユーザー）からのクエスト提案INSERTを許可するRLSポリシー
-- proposal_status = 'pending' のレコードのみ挿入可能（承認済みタスクは直接作成不可）
CREATE POLICY "tasks_insert_proposal" ON otetsudai_tasks
  FOR INSERT
  WITH CHECK (proposal_status = 'pending');
