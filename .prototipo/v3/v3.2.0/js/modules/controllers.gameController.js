/**
 * controllers/gameController.js
 * Wires together state, data loading, combo, and table UI.
 */
import { CONFIG, state } from "../modules/state.js";
import { loadData } from "../modules/data.js";
import { compareRow } from "../modules/logic/compare.js";
import { renderAttemptRow } from "../modules/ui/table.js";
import { initCombo } from "../modules/ui/combo.js";
import { $ } from "../modules/utils/dom.js";
import { sameItem } from "../modules/utils/text.js";

/**
 * Initialize one round of the game.
 * Relies on the structure present in v2/hardware.html.
 */
export async function initGame() {
  const els = {
    form:  $("#formGuess"),
    btn:   $("#btnConferir"),
    comboRoot: $("#comboOpcoes"),
    feedback:  $("#feedback"),
    tableWrap: $("#tabelaWrapper"),
    tbody:  $("#tabelaResultados tbody"),
    hiddenSel: $("#opcoes"), // holds selected index
    input: $("#opcoesCombo"),
  };

  try {
    await loadData();
    setFeedback("Digite para filtrar e selecione um item, depois clique em Conferir.");
  } catch (e){
    console.error(e);
    setFeedback("Erro ao carregar dados.");
    return;
  }

  // choose answer & build combo
  state.answerIndex = Math.floor(Math.random() * state.data.length);
  const combo = initCombo(els.comboRoot, (idx) => {
    els.input.value = state.data[idx].ITEM;
    els.hiddenSel.value = String(idx);
  });
  combo.sync();

  // show table when the first row is added
  let firstRow = true;

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const idx = Number(els.hiddenSel.value);
    if (!Number.isInteger(idx) || !state.available.has(idx)){
      setFeedback("Selecione um item válido.");
      return;
    }

    // Disallow repeated guesses and remove from list
    state.available.delete(idx);
    state.attempts.push(idx);
    combo.sync();
    combo.clear();

    // Render row (prepend newest first)
    const feedback = compareRow(idx);
    renderAttemptRow(state.attempts.length, feedback, els.tbody);

    if (firstRow){ els.tableWrap.hidden = false; firstRow = false; }

    // end state?
    const guessed = sameItem(state.data[idx].ITEM, state.data[state.answerIndex].ITEM);
    if (guessed){
      setFeedback(`Acertou! Era "${state.data[state.answerIndex].ITEM}".`);
      disableForm(els.form);
    } else if (state.attempts.length >= CONFIG.maxAttempts){
      setFeedback(`Fim de jogo! Resposta: "${state.data[state.answerIndex].ITEM}".`);
      disableForm(els.form);
    } else {
      setFeedback(`Tentativa ${state.attempts.length}/${CONFIG.maxAttempts}.`);
    }
  });

  function setFeedback(msg){ els.feedback.textContent = msg; }
  function disableForm(form){
    form.querySelectorAll("input,button,select").forEach(el => el.disabled = true);
    form.classList.add("is-disabled");
  }
}
