/**
 * ui/table.js
 * Renders the attempts table based on feedback rows.
 */
import { h } from "../utils/dom.js";

/**
 * Append a new attempt row.
 * @param {number} attemptNumber - 1-based attempt count
 * @param {Array<{key:string, value:string, status:'hit'|'partial'|'miss'}>} feedback
 * @param {HTMLElement} tbody
 */
export function renderAttemptRow(attemptNumber, feedback, tbody) {
  const tr = h("tr");
  tr.append(h("td", {}, [String(attemptNumber)]));
  for (const cell of feedback) {
    const td = h("td", { class: `cell ${cell.status}` }, [cell.value]);
    tr.append(td);
  }
  tbody.prepend(tr); // newest first, keep behavior similar to original
}
