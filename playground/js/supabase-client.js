/**
 * Supabase REST API クライアント
 * ─────────────────────────────
 * supabase-js SDK を使わず fetch のみで動作。
 * 外部依存ゼロで playground の可搬性を確保する。
 */

const SUPABASE_URL = 'https://ycqgkgtgkhxfvgfhlmqe.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljcWdrZ3Rna2h4ZnZnZmhsbXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzYxNDcsImV4cCI6MjA5MDYxMjE0N30.CBa5T_95eY5masA3VvC_RvEoVzqA314R76C9bNj32eI';

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

/** GET rows — params は PostgREST クエリ文字列 */
export async function dbSelect(table, params = '') {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${params}`,
    { headers }
  );
  return res.json();
}

/** INSERT rows */
export async function dbInsert(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

/** UPDATE rows — match は PostgREST フィルタ (例: "id=eq.xxx") */
export async function dbUpdate(table, match, body) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${match}`,
    { method: 'PATCH', headers, body: JSON.stringify(body) }
  );
  return res.json();
}

/** DELETE rows */
export async function dbDelete(table, match) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${match}`,
    { method: 'DELETE', headers }
  );
  return res.ok;
}
