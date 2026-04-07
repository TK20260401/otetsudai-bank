/**
 * 子ども向け画面
 * ──────────────
 * 貯金箱 / タスク一覧 & 完了報告 / 取引履歴
 */
import { dbSelect, dbInsert } from '../supabase-client.js';
import { getSession, clearSession } from '../router.js';
import { el, html, yen, dateJP } from '../ui.js';

const SAVING_GOAL = 5000;

export async function render(container, childId) {
  const session = getSession();
  if (!session || session.role !== 'child') {
    location.hash = '#login';
    return;
  }

  const page = el('div');
  container.appendChild(page);
  await loadChildBank(page, session, childId);
}

async function loadChildBank(page, session, childId) {
  page.innerHTML = '<div class="loading">よみこみ中...</div>';

  const [tasks, walletArr, txRaw] = await Promise.all([
    dbSelect('otetsudai_tasks',
      `family_id=eq.${session.familyId}&is_active=eq.true&or=(assigned_child_id.is.null,assigned_child_id.eq.${childId})&order=reward_amount`),
    dbSelect('otetsudai_wallets', `child_id=eq.${childId}`),
    dbSelect('otetsudai_transactions', `order=created_at.desc&limit=20`),
  ]);

  const wallet = walletArr[0] || null;
  const transactions = wallet
    ? txRaw.filter(t => t.wallet_id === wallet.id)
    : [];

  const total = wallet ? wallet.spending_balance + wallet.saving_balance : 0;
  const savePct = Math.min(Math.round(((wallet?.saving_balance || 0) / SAVING_GOAL) * 100), 100);

  page.innerHTML = '';

  // Header
  const header = el('div', { className: 'page-header' },
    html('div', { className: 'page-title' }, `🧒 ${session.name} のバンク`),
    el('button', { className: 'btn btn-ghost btn-sm', onclick: () => { clearSession(); location.hash = '#login'; } }, 'ログアウト')
  );

  // Piggy bank
  const piggy = el('div', { className: 'piggy' },
    html('div', { className: 'piggy-icon' }, '🐷'),
    html('div', { className: 'piggy-amount' }, yen(total)),
    html('div', { className: 'text-xs mb-4', style: { color: 'var(--amber-700)' } }, 'ぜんぶのおかね'),
    el('div', { className: 'cols-2 mb-3' },
      el('div', { className: 'wallet-box spending', style: { background: 'rgba(255,255,255,0.8)', borderRadius: '14px', padding: '12px', border: '1px solid rgba(255,255,255,0.5)' } },
        html('div', { className: 'wallet-label', style: { color: 'var(--blue-500)' } }, '💳 つかえるお金'),
        html('div', { className: 'wallet-value', style: { color: 'var(--blue-600)' } }, yen(wallet?.spending_balance))
      ),
      el('div', { className: 'wallet-box saving', style: { background: 'rgba(255,255,255,0.8)', borderRadius: '14px', padding: '12px', border: '1px solid rgba(255,255,255,0.5)' } },
        html('div', { className: 'wallet-label', style: { color: 'var(--green-500)' } }, '🏦 ちょきん'),
        html('div', { className: 'wallet-value', style: { color: 'var(--green-600)' } }, yen(wallet?.saving_balance))
      )
    ),
    el('div', { className: 'row', style: { fontSize: '11px', color: 'var(--amber-800)' } },
      html('span', {}, `もくひょう ${yen(SAVING_GOAL)}`),
      html('span', { className: 'fw-bold' }, `${savePct}%`)
    ),
    html('div', { className: 'progress progress-amber' },
      `<div class="progress-bar" style="width:${savePct}%"></div>`)
  );

  // Tabs
  let activeTab = 'tasks';
  const tabContent = el('div');
  const tabBar = el('div', { className: 'tab-bar' });

  const tabTasks = el('button', { className: 'tab active', onclick: () => switchTab('tasks') }, '📋 おてつだい');
  const tabHistory = el('button', { className: 'tab', onclick: () => switchTab('history') }, '📜 りれき');
  tabBar.append(tabTasks, tabHistory);

  function switchTab(tab) {
    activeTab = tab;
    tabTasks.className = tab === 'tasks' ? 'tab active' : 'tab';
    tabHistory.className = tab === 'history' ? 'tab active' : 'tab';
    renderTabContent();
  }

  function renderTabContent() {
    tabContent.innerHTML = '';
    if (activeTab === 'tasks') {
      renderTasks(tabContent, tasks, childId, page, session);
    } else {
      renderHistory(tabContent, transactions);
    }
  }

  page.append(header, piggy, tabBar, tabContent);
  renderTabContent();
}

function renderTasks(container, tasks, childId, page, session) {
  if (tasks.length === 0) {
    container.appendChild(html('div', { className: 'empty' }, 'いまできるおてつだいはないよ 😴'));
    return;
  }

  const REC_LABELS = { once: '1かい', daily: 'まいにち', weekly: 'まいしゅう' };

  for (const task of tasks) {
    const doneBtn = el('button', {
      className: 'btn btn-success',
      style: { fontSize: '14px', padding: '10px 16px', whiteSpace: 'nowrap' },
      onclick: async (e) => {
        e.target.disabled = true;
        e.target.textContent = '...';
        await dbInsert('otetsudai_task_logs', {
          task_id: task.id,
          child_id: childId,
          status: 'pending',
        });
        await loadChildBank(page, session, childId);
      },
    }, 'できた！✓');

    const card = el('div', { className: 'task-card' },
      el('div', {},
        html('div', { className: 'task-title' }, task.title),
        task.description ? html('div', { className: 'task-desc' }, task.description) : null,
        el('div', { className: 'task-meta' },
          html('span', { className: 'badge badge-amber' }, yen(task.reward_amount)),
          html('span', { className: 'badge badge-gray' }, REC_LABELS[task.recurrence] || task.recurrence)
        )
      ),
      doneBtn
    );
    container.appendChild(card);
  }
}

function renderHistory(container, transactions) {
  const card = el('div', { className: 'card' });
  card.appendChild(html('div', { className: 'card-header' }, '📜 さいきんのりれき'));

  if (transactions.length === 0) {
    card.appendChild(html('div', { className: 'empty' }, 'まだりれきがないよ'));
    container.appendChild(card);
    return;
  }

  for (const tx of transactions) {
    const icon = tx.type === 'earn' ? '💰' : tx.type === 'spend' ? '🛒' : '🏦';
    const color = tx.type === 'earn' ? 'var(--green-600)' : 'var(--red-500)';
    const sign = tx.type === 'earn' ? '+' : '-';

    const item = el('div', { className: 'list-item' },
      el('div', {},
        html('div', { className: 'text-sm fw-bold' }, `${icon} ${tx.description || tx.type}`),
        html('div', { className: 'text-xs' }, dateJP(tx.created_at))
      ),
      html('span', { style: { fontWeight: '800', color, fontSize: '14px' } }, `${sign}${yen(tx.amount)}`)
    );
    card.appendChild(item);
  }

  container.appendChild(card);
}
