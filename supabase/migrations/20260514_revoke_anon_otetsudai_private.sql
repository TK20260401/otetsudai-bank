-- Supabase 2026-05-30 / 2026-10-30 GRANT変更に備えた予防的REVOKE
-- otetsudai_*テーブルはログイン必須のため、anonロールから全権限を剥奪する
-- 除外: stock_prices / wallets / spend_requests / transactions
--   (anon-onlyのサーバAPIから参照されているため、API修正後に追加REVOKE予定)
-- authenticated / service_role は維持
revoke all on public.otetsudai_announcements          from anon;
revoke all on public.otetsudai_badges                 from anon;
revoke all on public.otetsudai_chapter_unlocks        from anon;
revoke all on public.otetsudai_chapters               from anon;
revoke all on public.otetsudai_conversation_logs      from anon;
revoke all on public.otetsudai_daily_logins           from anon;
revoke all on public.otetsudai_families               from anon;
revoke all on public.otetsudai_family_challenges      from anon;
revoke all on public.otetsudai_family_messages        from anon;
revoke all on public.otetsudai_family_settings        from anon;
revoke all on public.otetsudai_invest_orders          from anon;
revoke all on public.otetsudai_invite_tokens          from anon;
revoke all on public.otetsudai_messages               from anon;
revoke all on public.otetsudai_nudge_log              from anon;
revoke all on public.otetsudai_pets                   from anon;
revoke all on public.otetsudai_saving_goals           from anon;
revoke all on public.otetsudai_settings               from anon;
revoke all on public.otetsudai_shop_purchases         from anon;
revoke all on public.otetsudai_task_logs              from anon;
revoke all on public.otetsudai_tasks                  from anon;
revoke all on public.otetsudai_transactions_backup_20260430 from anon;
revoke all on public.otetsudai_users                  from anon;
