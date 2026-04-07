/**
 * 親ダッシュボード
 * ────────────────
 * 承認待ちタスクの処理 / 子どもの残高確認
 */
import { dbSelect, dbUpdate, dbInsert } from '../supabase-client.js';
import { getSession, clearSession } from '../router.js';
import { el, html, yen, dateJP } from '../ui.js';

export async function render(container) {
  const session = getSession();
  if (!session || session.role !== 'parent') {
    location.hash = '#login';
    return;
  }

  const page = el('div');
  container.appendChild(page);
  await loadDashboard(page, session);
}

async function loadDashboard(page, session) {
  page.innerHTML = '<div class="loading">読み込み中...</div>';

  // 並列フェッチ
  const [children, wallets, pendingRaw, approvedRaw] = await Promise.all([
    dbSelect('otetsudai_users', `family_id=eq.${session.familyId}&role=eq.child&order=name`),
    dbSelect('otetsudai_wallets', 'order=child_id'),
    dbSelect('otetsudai_task_logs', `status=eq.pending&select=*,task:task_id(*),child:child_id(id,name)&order=completed_at.desc`),
    dbSelect('otetsudai_task_logs', `status=eq.approved&select=*,task:task_id(reward_amount)`),
  ]);

  const walletMap = {};
  wallets.forEach(w => walletMap[w.child_id] = w);

  // Stats
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const totalEarned = approvedRaw.reduce((s, l) => s + (l.task?.reward_amount || 0), 0);
  const weeklyCount = approvedRaw.filter(l => l.approved_at && new Date(l.approved_at).getTime() > weekAgo).length;

  page.innerHTML = '';

  // Header
  const header = el('div', { className: 'page-header' },
    el('div', {},
      html('div', { className: 'page-title' }, '🏦 おやダッシュボード'),
      html('div', { className: 'page-subtitle' }, `${session.name} さん`)
    ),
    el('div', { className: 'flex gap-2' },
      el('button', { className: 'btn btn-outline btn-sm', onclick: () => location.hash = '#tasks' }, '📋 タスク管理'),
      el('button', { className: 'btn btn-ghost btn-sm', onclick: () => { clearSession(); location.hash = '#login'; } }, 'ログアウト')
    )
  );

  // Stats row
  const stats = el('div', { className: 'stat-row' },
    el('div', { className: 'stat' },
      html('div', { className: 'stat-value', style: { color: 'var(--amber-500)' } }, String(approvedRaw.length)),
      html('div', { className: 'stat-label' }, '承認済み')
    ),
    el('div', { className: 'stat' },
      html('div', { className: 'stat-value', style: { color: 'var(--green-600)' } }, yen(totalEarned)),
      html('div', { className: 'stat-label' }, '総獲得')
    ),
    el('div', { className: 'stat' },
      html('div', { className: 'stat-value', style: { color: 'var(--blue-600)' } }, String(weeklyCount)),
      html('div', { className: 'stat-label' }, '今週')
    )
  );

  // Pending approvals
  const pendingCard = el('div', { className: 'card' });
  pendingCard.appendChild(
    html('div', { className: 'card-header' },
      `⏳ 承認待ち ${pendingRaw.length > 0 ? `<span class="badge badge-red">${pendingRaw.length}</span>` : ''}`)
  );

  if (pendingRaw.length === 0) {
    pendingCard.appendChild(html('div', { className: 'empty' }, '承認待ちはありません 🎉'));
  } else {
    for (const log of pendingRaw) {
      const item = el('div', { className: 'approval-item' },
        el('div', { className: 'row' },
          el('div', {},
            html('div', { className: 'fw-bold' }, log.task?.title || '—'),
            html('div', { className: 'text-xs mt-1' },
              `🧒 ${log.child?.name || '—'} ・ ${yen(log.task?.reward_amount)} ・ ${dateJP(log.completed_at)}`)
          ),
          el('div', { className: 'flex gap-1' },
            el('button', {
              className: 'btn btn-success btn-sm',
              onclick: async (e) => {
                e.target.disabled = true;
                await approveLog(log, walletMap, session);
                await loadDashboard(page, session);
              },
            }, '✓ 承認'),
            el('button', {
              className: 'btn btn-danger-outline btn-sm',
              onclick: async () => {
                await dbUpdate('otetsudai_task_logs', `id=eq.${log.id}`, { status: 'rejected' });
                await loadDashboard(page, session);
              },
            }, '✗')
          )
        )
      );
      pendingCard.appendChild(item);
    }
  }

  const divider = el('hr', { className: 'divider' });

  // Children wallets
  const walletTitle = html('div', { className: 'card-header mb-3' }, '💰 こどもの残高');
  const walletList = el('div');

  for (const child of children) {
    const w = walletMap[child.id];
    const total = w ? w.spending_balance + w.saving_balance : 0;
    const savePct = w && total > 0 ? Math.round((w.saving_balance / total) * 100) : 0;

    const childCard = el('div', { className: 'card' },
      el('div', { className: 'row mb-2' },
        html('span', { className: 'fw-bold', style: { fontSize: '16px' } }, `🧒 ${child.name}`),
        html('span', { style: { fontSize: '20px', fontWeight: '800', color: 'var(--amber-800)' } }, yen(total))
      ),
      el('div', { className: 'cols-2 mb-2' },
        el('div', { className: 'wallet-box spending' },
          html('div', { className: 'wallet-label', style: { color: 'var(--blue-600)' } }, '💳 つかえるお金'),
          html('div', { className: 'wallet-value', style: { color: 'var(--blue-600)' } }, yen(w?.spending_balance))
        ),
        el('div', { className: 'wallet-box saving' },
          html('div', { className: 'wallet-label', style: { color: 'var(--green-600)' } }, '🏦 ちょきん'),
          html('div', { className: 'wallet-value', style: { color: 'var(--green-600)' } }, yen(w?.saving_balance))
        )
      ),
      el('div', { className: 'row', style: { fontSize: '11px', color: 'var(--gray-400)' } },
        html('span', {}, '貯蓄率'),
        html('div', { className: 'progress progress-green', style: { flex: '1', margin: '0 8px' } },
          `<div class="progress-bar" style="width:${savePct}%"></div>`),
        html('span', { style: { fontWeight: '700', color: 'var(--green-600)' } }, `${savePct}%`)
      )
    );
    walletList.appendChild(childCard);
  }

  page.append(header, stats, pendingCard, divider, walletTitle, walletList);
}

async function approveLog(log, walletMap, session) {
  await dbUpdate('otetsudai_task_logs', `id=eq.${log.id}`, {
    status: 'approved',
    approved_at: new Date().toISOString(),
    approved_by: session.userId,
  });

  const wallet = walletMap[log.child_id];
  if (wallet && log.task) {
    const reward = log.task.reward_amount;
    const savePortion = Math.floor((reward * wallet.split_ratio) / 100);
    const spendPortion = reward - savePortion;

    await dbUpdate('otetsudai_wallets', `id=eq.${wallet.id}`, {
      spending_balance: wallet.spending_balance + spendPortion,
      saving_balance: wallet.saving_balance + savePortion,
    });

    await dbInsert('otetsudai_transactions', {
      wallet_id: wallet.id,
      type: 'earn',
      amount: reward,
      description: `${log.task.title} 承認`,
      task_log_id: log.id,
    });
  }
}
