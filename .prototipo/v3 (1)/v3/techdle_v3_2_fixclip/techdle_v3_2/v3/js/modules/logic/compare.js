/**
 * logic/compare.js
 * Cell-by-cell comparison rules between a guess and the answer.
 * Returns an array of "feedback cells" with status for UI coloring.
 */
import { COLUMNS, PARTIALABLE_KEYS, state } from "../state.js";
import { normalize, tokenize } from "../utils/text.js";

/**
 * Compare two cell values, considering "partial" only for allowed keys.
 * Returns "hit" | "partial" | "miss".
 * @param {string} key - column key
 * @param {string} guessVal
 * @param {string} answerVal
 */
export function compareCellByKey(key, guessVal, answerVal) {
  // exact always wins
  if (normalize(guessVal) === normalize(answerVal)) return "hit";

  // only some keys admit partial overlap
  if (PARTIALABLE_KEYS.has(key)) {
    const gTokens = new Set(tokenize(guessVal));
    const aTokens = new Set(tokenize(answerVal));
    const hasOverlap = [...gTokens].some(t => aTokens.has(t));
    if (hasOverlap) return "partial";
  }
  return "miss";
}

/**
 * Build a row of feedback objects for a guess index.
 * @param {number} guessIndex
 * @param {number} [answerIndex=state.answerIndex]
 * @returns {Array<{key:string, value:string, status:'hit'|'partial'|'miss'}>}
 */
export function compareRow(guessIndex, answerIndex = state.answerIndex) {
  const g = state.data[guessIndex];
  const a = state.data[answerIndex];
  return COLUMNS.map(col => ({
    key: col.key,
    value: String(g[col.key] ?? ""),
    status: compareCellByKey(col.key, String(g[col.key] ?? ""), String(a[col.key] ?? ""))
  }));
}
