-- 2026-05-14: anon-only APIをservice_roleに切替したため、残り4テーブルもREVOKE
-- 該当API:
--   app/api/stock-sync/route.ts → otetsudai_stock_prices
--   app/api/spend-request/route.ts → otetsudai_wallets, otetsudai_spend_requests, otetsudai_transactions
revoke all on public.otetsudai_stock_prices  from anon;
revoke all on public.otetsudai_wallets       from anon;
revoke all on public.otetsudai_spend_requests from anon;
revoke all on public.otetsudai_transactions  from anon;
