/**
 * modules/data.js
 * Fetch and prepare dataset used by the game. Kept isolated so it can be
 * reused by other pages (e.g., a catalog browser) without the game UI.
 */
import { CONFIG, state } from "./state.js";

/**
 * Load componentes.json and populate state.data and state.available.
 * INPUT: none (uses CONFIG.jsonPath relative to current page)
 * OUTPUT: resolves when state is ready.
 * SIDE EFFECTS: modifies state.data, state.available
 * @returns {Promise<void>}
 */
export async function loadData() {
  const url = new URL(CONFIG.jsonPath, window.location.href).toString();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);

  const json = await res.json();
  const arr = Array.isArray(json) ? json : (json.resultados || []);
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("Estrutura de dados inválida ou vazia.");

  state.data = arr;
  state.available = new Set(arr.map((_, idx) => idx));
}
