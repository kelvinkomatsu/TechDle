/**
 * utils/dom.js
 * Small DOM helpers to keep code tidy & self-documenting.
 */

/** @param {string} sel */
export const $ = (sel, root = document) => root.querySelector(sel);
/** @param {string} sel */
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Create element with attributes and children.
 * @param {string} tag
 * @param {Object} [attrs]
 * @param {Array<Node|string>} [children]
 * @returns {HTMLElement}
 */
export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null) return;
    if (k === "class") el.className = v;
    else if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else {
      el.setAttribute(k, String(v));
    }
  });
  for (const c of children) el.append(c);
  return el;
}
