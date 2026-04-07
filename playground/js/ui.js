/**
 * 共通 UI ヘルパー
 * ────────────────
 * DOM 生成を簡潔にするユーティリティ。
 */

/** 要素生成ショートハンド */
export function el(tag, attrs = {}, ...children) {
  const elem = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') elem.className = v;
    else if (k === 'onclick') elem.addEventListener('click', v);
    else if (k === 'style' && typeof v === 'object') Object.assign(elem.style, v);
    else elem.setAttribute(k, v);
  }
  for (const child of children) {
    if (typeof child === 'string') elem.appendChild(document.createTextNode(child));
    else if (child) elem.appendChild(child);
  }
  return elem;
}

/** innerHTML をセットした要素 */
export function html(tag, attrs = {}, innerHTML = '') {
  const elem = el(tag, attrs);
  elem.innerHTML = innerHTML;
  return elem;
}

/** 数値をカンマ区切りで表示 */
export function yen(n) {
  return `¥${(n || 0).toLocaleString()}`;
}

/** 日本語日付 */
export function dateJP(iso) {
  return new Date(iso).toLocaleDateString('ja-JP');
}
