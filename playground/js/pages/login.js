/**
 * ログイン / 家族選択ページ
 * ─────────────────────────
 * 家族選択 → メンバー選択 → PIN入力 → ダッシュボードへ遷移
 */
import { dbSelect } from '../supabase-client.js';
import { setSession } from '../router.js';
import { el, html } from '../ui.js';

export async function render(container) {
  const wrap = el('div', { className: 'login-wrap' });
  const card = el('div', { className: 'login-card' });
  wrap.appendChild(card);
  container.appendChild(wrap);

  // Step 1: 家族選択
  await showFamilySelect(card);
}

async function showFamilySelect(card) {
  card.innerHTML = '';
  card.append(
    html('div', { className: 'login-icon' }, '🏦'),
    html('div', { className: 'login-title' }, 'おてつだいバンク'),
    html('div', { className: 'login-sub' }, 'お手伝いでコインをためよう！'),
    html('div', { className: 'label mb-2' }, 'おうちをえらんでね')
  );

  const families = await dbSelect('otetsudai_families', 'order=name');

  if (families.length === 0) {
    card.appendChild(html('div', { className: 'empty' }, 'まだおうちがないよ'));
    return;
  }

  for (const f of families) {
    const btn = el('button', {
      className: 'member-btn',
      onclick: () => showMemberSelect(card, f),
    },
      html('span', { style: { fontSize: '24px' } }, '🏠'),
      document.createTextNode(f.name)
    );
    card.appendChild(btn);
  }
}

async function showMemberSelect(card, family) {
  card.innerHTML = '';

  const header = el('div', { className: 'row mb-3' },
    el('button', { className: 'btn btn-ghost btn-sm', onclick: () => showFamilySelect(card) }, '← もどる'),
    html('span', { className: 'fw-bold', style: { color: 'var(--amber-700)' } }, family.name)
  );
  card.append(header, html('div', { className: 'label mb-2' }, 'だれかな？'));

  const members = await dbSelect('otetsudai_users', `family_id=eq.${family.id}&order=role.desc,name`);

  for (const m of members) {
    const icon = m.role === 'parent' ? '👨‍👩‍👧‍👦' : '🧒';
    const roleLabel = m.role === 'parent' ? 'おやこうざ' : 'こどもこうざ';

    const btn = el('button', {
      className: 'member-btn',
      onclick: () => showPinOrLogin(card, family, m),
    },
      html('span', { style: { fontSize: '24px' } }, icon),
      document.createTextNode(m.name),
      html('span', { className: 'role-tag' }, roleLabel)
    );
    card.appendChild(btn);
  }
}

function showPinOrLogin(card, family, user) {
  // PIN なしならそのままログイン
  if (!user.pin) {
    doLogin(family, user);
    return;
  }

  card.innerHTML = '';

  const header = el('div', { className: 'row mb-3' },
    el('button', { className: 'btn btn-ghost btn-sm', onclick: () => showMemberSelect(card, family) }, '← もどる'),
    html('span', { className: 'fw-bold', style: { color: 'var(--amber-700)' } }, user.name)
  );

  const pinLabel = html('div', { className: 'label text-center' }, 'PINをいれてね 🔑');
  const errorMsg = html('div', {
    className: 'text-center text-sm mb-2',
    style: { color: 'var(--red-500)', minHeight: '20px' },
  }, '');

  // PIN input (hidden) + visual dots
  const pinInput = el('input', {
    type: 'text',
    maxlength: '4',
    className: 'input',
    style: { position: 'absolute', opacity: '0', pointerEvents: 'none' },
  });

  const dots = el('div', { className: 'pin-dots' });
  for (let i = 0; i < 4; i++) {
    dots.appendChild(el('div', { className: 'pin-dot', id: `dot-${i}` }));
  }

  // Wrapper to capture clicks → focus input
  const pinArea = el('div', {
    style: { cursor: 'pointer', position: 'relative' },
    onclick: () => pinInput.focus(),
  }, pinInput, dots);

  pinInput.addEventListener('input', () => {
    const val = pinInput.value.replace(/\D/g, '').slice(0, 4);
    pinInput.value = val;
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`dot-${i}`);
      dot.textContent = i < val.length ? '●' : '';
      dot.className = i < val.length ? 'pin-dot filled' : 'pin-dot';
    }
    errorMsg.textContent = '';
  });

  const loginBtn = el('button', {
    className: 'btn btn-primary btn-lg mt-3',
    onclick: () => {
      if (pinInput.value === user.pin) {
        doLogin(family, user);
      } else {
        errorMsg.textContent = 'PINが違います';
        pinInput.value = '';
        pinInput.dispatchEvent(new Event('input'));
      }
    },
  }, 'ログイン');

  card.append(header, pinLabel, pinArea, errorMsg, loginBtn);

  setTimeout(() => pinInput.focus(), 100);
}

function doLogin(family, user) {
  setSession({
    userId: user.id,
    familyId: family.id,
    role: user.role,
    name: user.name,
  });

  if (user.role === 'parent') {
    location.hash = '#parent';
  } else {
    location.hash = `#child:${user.id}`;
  }
}
