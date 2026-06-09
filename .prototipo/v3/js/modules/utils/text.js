/**
 * utils/text.js
 * Pure string utilities used across the app.
 * These helpers are deterministic and do not touch DOM/state,
 * which makes them easy to test and reuse across pages.
 */

/**
 * Remove diacritics (á, ç, ñ) from a string using Unicode normalization.
 * @param {string} s - Input string (may be undefined/null).
 * @returns {string} - String without diacritics.
 */
export const stripDiacritics = (s) =>
  String(s ?? "").normalize("NFD").replace(/\p{Diacritic}+/gu, "");

/**
 * Normalize user-facing text for comparisons/search:
 *  - trims
 *  - collapses whitespace
 *  - removes diacritics
 *  - lowercases
 * @param {string} s
 * @returns {string}
 */
export const normalize = (s) =>
  stripDiacritics(s).trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Tokenize a field that may include multiple values separated by '/', ',', ';'.
 * Empty markers like "x" or "—" are ignored.
 * @param {string} s
 * @returns {string[]} normalized tokens (may be empty).
 */
export const tokenize = (s) => {
  const n = normalize(s);
  if (!n || n === "x" || n === "—") return [];
  return n.split(/[\/,;]+/).map(t => t.trim()).filter(Boolean);
};

/**
 * Compare two "ITEM" labels using normalized form.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export const sameItem = (a, b) => normalize(a) === normalize(b);
