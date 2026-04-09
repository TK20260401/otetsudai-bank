-- アプリのログインがlocalStorage（PIN認証）ベースで、
-- Supabase Auth未使用のためget_my_family_id()が機能しない問題を解消。
-- アプリ側でsession.familyIdによるフィルタを実施しているため、
-- anon roleに対してSELECT/INSERT/UPDATEを許可するポリシーを追加。

-- tasks
CREATE POLICY "anon_select_tasks" ON otetsudai_tasks FOR SELECT USING (true);
CREATE POLICY "anon_update_tasks" ON otetsudai_tasks FOR UPDATE USING (true);

-- task_logs
CREATE POLICY "anon_select_task_logs" ON otetsudai_task_logs FOR SELECT USING (true);
CREATE POLICY "anon_insert_task_logs" ON otetsudai_task_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_task_logs" ON otetsudai_task_logs FOR UPDATE USING (true);

-- wallets
CREATE POLICY "anon_select_wallets" ON otetsudai_wallets FOR SELECT USING (true);
CREATE POLICY "anon_insert_wallets" ON otetsudai_wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_wallets" ON otetsudai_wallets FOR UPDATE USING (true);

-- transactions
CREATE POLICY "anon_select_transactions" ON otetsudai_transactions FOR SELECT USING (true);
CREATE POLICY "anon_insert_transactions" ON otetsudai_transactions FOR INSERT WITH CHECK (true);

-- spend_requests
CREATE POLICY "anon_select_spend_requests" ON otetsudai_spend_requests FOR SELECT USING (true);
CREATE POLICY "anon_insert_spend_requests" ON otetsudai_spend_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_spend_requests" ON otetsudai_spend_requests FOR UPDATE USING (true);

-- badges
CREATE POLICY "anon_select_badges" ON otetsudai_badges FOR SELECT USING (true);
CREATE POLICY "anon_insert_badges" ON otetsudai_badges FOR INSERT WITH CHECK (true);

-- saving_goals
CREATE POLICY "anon_select_saving_goals" ON otetsudai_saving_goals FOR SELECT USING (true);
CREATE POLICY "anon_insert_saving_goals" ON otetsudai_saving_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_saving_goals" ON otetsudai_saving_goals FOR UPDATE USING (true);
