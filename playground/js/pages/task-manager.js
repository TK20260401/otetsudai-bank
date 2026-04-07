/**
 * タスク作成・管理ページ（親）
 * ─────────────────────────
 * タスクの CRUD + 有効/無効切替
 */
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '../supabase-client.js';
import { getSession } from '../router.js';
import { el, html, yen } from '../ui.js';

const REC_LABELS = { once: '1回', daily: '毎日', weekly: '毎週' };
let dialogOverlay = null;

export async function render(container) {
  const session = getSession();
  if (!session || session.role !== 'parent') {
    location.hash = '#login';
    return;
  }

  const page = el('div');
  container.appendChild(page);
  await loadTasks(page, session);
}

export function cleanup() {
  if (dialogOverlay) {
    dialogOverlay.remove();
    dialogOverlay = null;
  }
}

async function loadTasks(page, session) {
  page.innerHTML = '<div class="loading">読み込み中...</div>';

  const [tasks, children] = await Promise.all([
    dbSelect('otetsudai_tasks', `family_id=eq.${session.familyId}&order=created_at.desc`),
    dbSelect('otetsudai_users', `family_id=eq.${session.familyId}&role=eq.child&order=name`),
  ]);

  page.innerHTML = '';

  // Header
  const header = el('div', { className: 'page-header' },
    el('div', { className: 'flex items-center gap-2' },
      el('button', { className: 'btn btn-ghost btn-sm', onclick: () => location.hash = '#parent' }, '←'),
      html('div', { className: 'page-title' }, '📋 タスク管理')
    ),
    el('button', {
      className: 'btn btn-primary btn-sm',
      onclick: () => openDialog(null, session, children, page),
    }, '＋ 新規')
  );
  page.appendChild(header);

  if (tasks.length === 0) {
    page.appendChild(html('div', { className: 'empty' }, 'まだタスクがありません。「＋ 新規」から作成しましょう！'));
    return;
  }

  for (const task of tasks) {
    const assignee = children.find(c => c.id === task.assigned_child_id);

    const card = el('div', { className: `task-card ${task.is_active ? '' : 'inactive'}` },
      el('div', {},
        el('div', { className: 'row gap-2 mb-1' },
          html('span', { className: 'task-title' }, task.title),
          html('span', { className: 'badge badge-amber' }, REC_LABELS[task.recurrence] || task.recurrence),
          ...(!task.is_active ? [html('span', { className: 'badge badge-gray' }, '停止中')] : [])
        ),
        task.description ? html('div', { className: 'task-desc' }, task.description) : null,
        el('div', { className: 'task-meta' },
          html('span', { style: { color: 'var(--amber-600)', fontWeight: '700', fontSize: '13px' } }, yen(task.reward_amount)),
          assignee ? html('span', { className: 'text-xs' }, `🧒 ${assignee.name}`) : null
        )
      ),
      el('div', { className: 'flex gap-1' },
        el('button', { className: 'btn-icon', onclick: () => openDialog(task, session, children, page) }, '✏️'),
        el('button', {
          className: 'btn-icon',
          onclick: async () => {
            await dbUpdate('otetsudai_tasks', `id=eq.${task.id}`, { is_active: !task.is_active });
            await loadTasks(page, session);
          },
        }, task.is_active ? '⏸' : '▶️'),
        el('button', {
          className: 'btn-icon',
          onclick: async () => {
            if (confirm('このタスクを削除しますか？')) {
              await dbDelete('otetsudai_tasks', `id=eq.${task.id}`);
              await loadTasks(page, session);
            }
          },
        }, '🗑')
      )
    );
    page.appendChild(card);
  }
}

function openDialog(task, session, children, page) {
  // Remove existing dialog
  cleanup();

  const isEdit = !!task;
  const form = {
    title: task?.title || '',
    description: task?.description || '',
    reward_amount: task?.reward_amount ?? 100,
    recurrence: task?.recurrence || 'once',
    assigned_child_id: task?.assigned_child_id || '',
  };

  const titleInput = el('input', { className: 'input', value: form.title, placeholder: '例：お風呂そうじ' });
  const descInput = el('textarea', { className: 'textarea', placeholder: 'どうやるか書いてね' });
  descInput.value = form.description;
  const rewardInput = el('input', { className: 'input', type: 'number', min: '0', step: '10', value: String(form.reward_amount) });

  const recSelect = el('select', { className: 'select' });
  for (const [v, l] of Object.entries(REC_LABELS)) {
    const opt = el('option', { value: v }, l);
    if (v === form.recurrence) opt.selected = true;
    recSelect.appendChild(opt);
  }

  const childSelect = el('select', { className: 'select' });
  childSelect.appendChild(el('option', { value: '' }, 'みんな'));
  for (const c of children) {
    const opt = el('option', { value: c.id }, c.name);
    if (c.id === form.assigned_child_id) opt.selected = true;
    childSelect.appendChild(opt);
  }

  const saveBtn = el('button', {
    className: 'btn btn-primary btn-lg mt-3',
    onclick: async () => {
      const payload = {
        family_id: session.familyId,
        title: titleInput.value.trim(),
        description: descInput.value.trim() || null,
        reward_amount: parseInt(rewardInput.value) || 0,
        recurrence: recSelect.value,
        assigned_child_id: childSelect.value || null,
      };
      if (!payload.title) { titleInput.focus(); return; }

      if (isEdit) {
        await dbUpdate('otetsudai_tasks', `id=eq.${task.id}`, payload);
      } else {
        await dbInsert('otetsudai_tasks', payload);
      }
      cleanup();
      await loadTasks(page, session);
    },
  }, isEdit ? '更新する' : '作成する');

  const dialog = el('div', { className: 'dialog' },
    html('div', { className: 'dialog-title' }, isEdit ? 'タスクを編集' : 'あたらしいタスク'),
    el('div', { className: 'field' }, html('div', { className: 'label' }, 'タスク名'), titleInput),
    el('div', { className: 'field' }, html('div', { className: 'label' }, 'せつめい（任意）'), descInput),
    el('div', { className: 'cols-2' },
      el('div', { className: 'field' }, html('div', { className: 'label' }, 'ごほうび (¥)'), rewardInput),
      el('div', { className: 'field' }, html('div', { className: 'label' }, 'くりかえし'), recSelect)
    ),
    el('div', { className: 'field mt-2' }, html('div', { className: 'label' }, 'だれのタスク？'), childSelect),
    saveBtn
  );

  dialogOverlay = el('div', {
    className: 'dialog-overlay',
    onclick: (e) => { if (e.target === dialogOverlay) cleanup(); },
  }, dialog);

  document.body.appendChild(dialogOverlay);
  titleInput.focus();
}
