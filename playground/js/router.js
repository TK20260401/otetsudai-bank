/**
 * ハッシュベース SPA ルーター
 * ──────────────────────────
 * #login / #parent / #tasks / #child:id の 4 ルート。
 * 各ページモジュールは { render(container), cleanup?() } を export する。
 */

const routes = {};       // name → () => import(module)
let currentCleanup = null;

/** ルート登録 */
export function registerRoute(name, loader) {
  routes[name] = loader;
}

/** 現在のハッシュからルート名とパラメータを取得 */
function parseHash() {
  const raw = location.hash.slice(1) || 'login';   // デフォルトは login
  const [name, ...rest] = raw.split(':');
  return { name, param: rest.join(':') };
}

/** ルート切替 */
async function navigate() {
  const { name, param } = parseHash();
  const loader = routes[name];
  if (!loader) {
    location.hash = '#login';
    return;
  }
  const app = document.getElementById('app');
  if (!app) return;

  // 前ページのクリーンアップ
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  app.innerHTML = '<div class="loading">読み込み中...</div>';

  const page = await loader();
  app.innerHTML = '';
  currentCleanup = page.cleanup || null;
  await page.render(app, param);
}

/** セッション管理 */
export function setSession(data) {
  sessionStorage.setItem('otetsudai_session', JSON.stringify(data));
}

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem('otetsudai_session'));
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem('otetsudai_session');
}

/** 初期化 */
export function initRouter() {
  window.addEventListener('hashchange', navigate);
  navigate();
}
