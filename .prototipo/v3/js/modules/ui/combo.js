/**
 * ui/combo.js
 * Accessible combo-box (input + filtered list) used for selecting a component.
 * Exposes a small API so pages can reuse it.
 */
import { h, $, $$ } from "../utils/dom.js";
import { state } from "../state.js";
import { normalize } from "../utils/text.js";

/**
 * Create the combo in a given container.
 * Expected HTML:
 * <span id="comboOpcoes">
 *   <input id="opcoesCombo" type="text">
 *   <div id="opcoesList" role="listbox"></div>
 *   <input id="opcoes" type="hidden">
 * </span>
 *
 * @param {HTMLElement} root - container element
 * @param {function(number):void} onSelectIndex - called with index selected
 */
export function initCombo(root, onSelectIndex){
  const input = $("#opcoesCombo", root);
  const list  = $("#opcoesList", root);
  const hiddenSel = $("#opcoes", root);

  function openList(){ list.hidden = false; root.dataset.open = "1"; input.setAttribute("aria-expanded","true"); }
  function closeList(){ list.hidden = true;  root.dataset.open = "0"; input.setAttribute("aria-expanded","false"); }
  function setActive(el){ $$(".combo-option", list).forEach(n => n.setAttribute("aria-selected","false")); if (el) el.setAttribute("aria-selected","true"); }

  function renderOption(idx, label){
    const el = h("div", {
      class: "combo-option",
      role: "option",
      "data-index": idx
    }, [label]);
    el.addEventListener("click", () => { onSelectIndex(idx); closeList(); });
    list.append(el);
  }

  /** Recreate the visual list from current state.available */
  function syncOptions(){
    list.innerHTML = "";
    [...state.available].forEach(idx => renderOption(idx, state.data[idx].ITEM));
  }

  /** Filter list by current input value. */
  function filterList(value){
    const q = normalize(value);
    $$(".combo-option", list).forEach(el => {
      const label = normalize(el.textContent || "");
      el.hidden = q && !label.includes(q);
    });
  }

  /** Keyboard navigation. */
  function moveActive(delta){
    const visible = $$(".combo-option:not([hidden])", list);
    const cur = visible.findIndex(n => n.getAttribute("aria-selected") === "true");
    const next = visible[Math.max(0, Math.min(visible.length - 1, (cur === -1 ? 0 : cur + delta)))];
    setActive(next);
    next?.scrollIntoView({ block: "nearest" });
  }

  // public (minimal) API for external orchestration
  const api = {
    open: openList, close: closeList, filter: filterList, sync: syncOptions,
    setValue: (v) => { input.value = v; hiddenSel.value = v; filterList(v); },
    clear: () => { input.value = ""; hiddenSel.value = ""; },
    get value(){ return input.value; },
    get elements(){ return { input, list, hiddenSel }; }
  };

  // events
  input.addEventListener("focus", () => { openList(); filterList(input.value); });
  input.addEventListener("click",  () => { openList(); filterList(input.value); });
  input.addEventListener("input", () => { openList(); filterList(input.value); setActive($$(".combo-option:not([hidden])", list)[0]); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown"){ e.preventDefault(); openList(); moveActive(+1); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); openList(); moveActive(-1); }
    else if (e.key === "Enter"){
      const active = $$(".combo-option[aria-selected='true']:not([hidden])", list)[0];
      if (active) onSelectIndex(Number(active.dataset.index)), closeList();
    } else if (e.key === "Escape"){ closeList(); }
  });
  document.addEventListener("click", (e) => { if (!e.target.closest("#comboOpcoes")) closeList(); });

  // initial render
  syncOptions();
  return api;
}
