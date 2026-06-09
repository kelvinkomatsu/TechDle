document.addEventListener("DOMContentLoaded", () => {
  // ======================== ESQUEMA DAS COLUNAS ========================
  // key: nome no JSON | partial: a coluna pode ter acerto parcial por sobreposição (ex.: "USB, P2")
  const COLUMN_MAP = Object.freeze([
    { key: "ITEM",               labelShort: "Item",        labelLong: "Item",                 partial: false },
    { key: "TIPO",               labelShort: "Tipo",        labelLong: "Tipo",                 partial: true  },
    { key: "CONEXAO",            labelShort: "Conexão",     labelLong: "Conexão",              partial: true  },
    { key: "FUNCAO",             labelShort: "Função",      labelLong: "Função",               partial: true  },
    { key: "ENERGIA",            labelShort: "Energia",     labelLong: "Energia",              partial: true  },
    { key: "TIPO_DE_MEMORIA",    labelShort: "Memória",     labelLong: "Tipo de memória",      partial: true  },
    { key: "INSTALACAO",         labelShort: "Instalação",  labelLong: "Instalação",           partial: true  },
    { key: "TIPO_DE_TECNOLOGIA", labelShort: "Tecnologia",  labelLong: "Tipo de tecnologia",   partial: true  },
  ]);
  const FIELD_KEYS = COLUMN_MAP.map(c => c.key);
  const PARTIALABLE_KEYS = new Set(COLUMN_MAP.filter(c => c.partial).map(c => c.key));

  // ======================== CONFIG GERAL ========================
  const CONFIG = Object.freeze({
    prependRows: true,               // novas tentativas aparecem no topo
    jsonPath: "src/componentes.json",
    placeholderValue: "",            // valor "vazio" do hidden #opcoes
  });

  // ======================== DOM & STATE ========================
  const $  = (sel, ctx = document) => ctx.querySelector(sel);

  const els = {
    // combobox
    comboWrap:  $("#comboOpcoes"),
    comboInput: $("#opcoesCombo"),
    comboList:  $("#opcoesList"),
    hiddenSel:  $("#opcoes"),              // hidden: armazena o índice selecionado

    // jogo
    form:       $("#formGuess"),
    feedback:   $("#feedback"),
    tableWrap:  $("#tabelaWrapper"),
    tbody:      $("#tabelaResultados tbody"),
  };

  if (!els.form || !els.feedback || !els.tableWrap || !els.tbody || !els.comboInput || !els.comboList || !els.hiddenSel) {
    console.error("❌ IDs do HTML não encontrados. Verifique markup exigido pelo game.js.");
    return;
  }

  const state = {
    data: [],
    targetIndex: null,
    used: new Set(),        // índices já tentados
    available: new Set(),   // índices ainda selecionáveis no combobox
    attemptN: 0,
    gameOver: false,
  };

  // ======================== HELPERS (PUROS) ========================
  const stripDiacritics = (s) =>
    String(s ?? "").normalize("NFD").replace(/\p{Diacritic}+/gu, "");

  const normalize = (s) =>
    stripDiacritics(s).trim().replace(/\s+/g, " ").toLowerCase();

  const tokenize = (s) => {
    const n = normalize(s);
    if (!n || n === "x" || n === "—") return [];
    return n.split(/[\/,;]+/).map(t => t.trim()).filter(Boolean);
  };

  /** "correct" | "partial" | "incorrect" */
  function compareCell(guess, target, key) {
    const g = normalize(guess);
    const t = normalize(target);
    if (g === t) return "correct";
    if (!PARTIALABLE_KEYS.has(key)) return "incorrect";

    const gSet = new Set(tokenize(guess));
    const tSet = new Set(tokenize(target));
    if (gSet.size && tSet.size) {
      let inter = 0; gSet.forEach(v => { if (tSet.has(v)) inter++; });
      if (inter > 0 && (inter < gSet.size || inter < tSet.size)) return "partial";
    }
    return "incorrect";
  }

  const sameItem = (a, b) => normalize(a?.ITEM) === normalize(b?.ITEM);

  // ======================== UI HELPERS ========================
  const setFeedback = (msg) => { els.feedback.textContent = msg; els.feedback.focus?.(); };
  const showTable = () => { els.tableWrap.hidden = false; };
  const disableForm = () => {
    els.comboInput.disabled = true;
    const btn = els.form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    els.form.classList.add("is-over");
    els.form.setAttribute("aria-disabled", "true");
  };

  // ======================== COMBOBOX (INPUT + LISTA) ========================
  function renderComboOption(index, label){
    const div = document.createElement("div");
    div.role = "option";
    div.className = "combo-option";
    div.dataset.index = String(index);
    div.textContent = label ?? `Item ${index + 1}`;
    div.tabIndex = -1;
    div.addEventListener("click", () => selectByIndex(index));
    els.comboList.appendChild(div);
  }

  function addOption(index, label){
    state.available.add(index);
    renderComboOption(index, label);
  }

  function removeOptionByIndex(index){
    state.available.delete(index);
    const el = els.comboList.querySelector(`.combo-option[data-index="${index}"]`);
    if (el) el.remove();
    els.hiddenSel.value = CONFIG.placeholderValue;
  }

  function openList(){
    els.comboList.hidden = false;
    els.comboInput.setAttribute("aria-expanded","true");
    Array.from(els.comboList.children).forEach(n => n.hidden = false);
  }
  function closeList(){
    els.comboList.hidden = true;
    els.comboInput.setAttribute("aria-expanded","false");
  }

  function filterList(termRaw){
    const term = normalize(termRaw);
    Array.from(els.comboList.children).forEach(opt => {
      const idx = Number(opt.dataset.index);
      if (!state.available.has(idx)) { opt.hidden = true; return; }
      const label = normalize(opt.textContent || "");
      opt.hidden = term.length ? !label.includes(term) : false;
    });
  }

  function selectByIndex(index){
    if (!state.available.has(index) || state.used.has(index)) return; // anti-injeção/duplicado
    const opt = els.comboList.querySelector(`.combo-option[data-index="${index}"]`);
    if (!opt) return;

    Array.from(els.comboList.children).forEach(n => n.setAttribute("aria-selected","false"));
    opt.setAttribute("aria-selected","true");

    els.comboInput.value = opt.textContent || "";
    els.hiddenSel.value  = String(index);
    closeList();
  }

  function getFirstVisibleIndex(){
    const el = Array.from(els.comboList.children).find(n => !n.hidden);
    return el ? Number(el.dataset.index) : null;
  }

  function moveActive(delta){
    const items = Array.from(els.comboList.children).filter(n => !n.hidden);
    if (items.length === 0) return;
    let current = items.findIndex(n => n.getAttribute("aria-selected") === "true");
    if (current === -1) current = 0;
    else current = Math.min(Math.max(current + delta, 0), items.length - 1);
    items.forEach(n => n.setAttribute("aria-selected","false"));
    items[current].setAttribute("aria-selected","true");
    items[current].scrollIntoView({ block:"nearest" });
  }

  function resetCombo(){
    els.comboInput.value = "";
    els.hiddenSel.value  = CONFIG.placeholderValue;
    openList();
    filterList("");
    closeList();
  }

  // ======================== CARREGAR DADOS ========================
  async function loadData() {
    const url = new URL(CONFIG.jsonPath, window.location.href).toString();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);

    const json = await res.json();
    const arr = Array.isArray(json) ? json : (json.resultados || []);
    if (!Array.isArray(arr) || arr.length === 0) throw new Error("Estrutura de dados inválida ou vazia.");

    state.data = arr;
    state.available = new Set();
    els.comboList.innerHTML = "";
    arr.forEach((item, idx) => addOption(idx, item.ITEM));

    // alvo aleatório (por enquanto)
    state.targetIndex = Math.floor(Math.random() * arr.length);

    // estado inicial do combo
    resetCombo();
  }

  // ======================== RENDER TENTATIVA ========================
  function renderAttemptRow(guessObj, targetObj, attemptN) {
    let correctCount = 0;
    let partialCount = 0;

    const tr = document.createElement("tr");

    // Coluna "#"
    const tdNum = document.createElement("td");
    tdNum.textContent = String(attemptN);
    tdNum.classList.add("cell-num");
    tr.appendChild(tdNum);

    // Demais colunas
    FIELD_KEYS.forEach(key => {
      const gVal = guessObj?.[key] ?? "—";
      const tVal = targetObj?.[key] ?? "—";
      const status = compareCell(gVal, tVal, key);
      if (status === "correct") correctCount++;
      else if (status === "partial") partialCount++;

      const td = document.createElement("td");
      td.textContent = gVal;
      td.classList.add(
        status === "correct" ? "cell-correct" :
        status === "partial" ? "cell-partial" : "cell-incorrect"
      );
      tr.appendChild(td);
    });

    // Classe da linha para badge #
    if (correctCount === FIELD_KEYS.length) tr.classList.add("row-complete");
    else if (correctCount === 0 && partialCount === 0) tr.classList.add("row-none");
    else tr.classList.add("row-partial");

    // Inserção
    if (CONFIG.prependRows && els.tbody.firstChild) els.tbody.insertBefore(tr, els.tbody.firstChild);
    else els.tbody.appendChild(tr);

    showTable();
    return { correctCount, partialCount, allCorrect: correctCount === FIELD_KEYS.length };
  }

  // ======================== SUBMIT ========================
  function onSubmit(e) {
    e.preventDefault();
    if (state.gameOver) return;

    const raw = els.hiddenSel.value; // índice escolhido, vindo do combobox
    if (!raw && raw !== "0") { setFeedback("Escolha um item antes de conferir."); return; }

    const idx = Number(raw);
    if (!Number.isInteger(idx) || !state.available.has(idx)) { // anti-injeção
      setFeedback("Seleção inválida."); return;
    }
    if (state.used.has(idx)) { setFeedback("⚠️ Esse item já foi tentado. Escolha outro."); return; }

    const guess  = state.data[idx];
    const target = state.data[state.targetIndex];

    // ✅ Encerrar imediatamente se for o item correto (por índice OU por nome)
    if (idx === state.targetIndex || sameItem(guess, target)) {
      state.gameOver = true;
      state.used.add(idx);
      removeOptionByIndex(idx);
      state.attemptN += 1;
      renderAttemptRow(guess, target, state.attemptN);
      disableForm();
      setFeedback("🏆 Você descobriu o item! Jogo encerrado.");
      return;
    }

    // fluxo normal (não acertou o item)
    state.used.add(idx);
    removeOptionByIndex(idx);
    state.attemptN += 1;

    const result = renderAttemptRow(guess, target, state.attemptN);

    if (result.allCorrect) {
      state.gameOver = true;
      disableForm();
      setFeedback("🏆 Você descobriu o item! Jogo encerrado.");
      return;
    }

    if (result.correctCount === 0 && result.partialCount === 0) {
      setFeedback("❌ Nenhum campo bateu. Tente novamente!");
    } else {
      setFeedback(`🟡 Parcial: ${result.correctCount}/${FIELD_KEYS.length} corretos (${result.partialCount} parciais).`);
    }

    // fim de opções também encerra
    if (!state.gameOver && state.available.size === 0) {
      disableForm();
      setFeedback("Fim das opções para tentar.");
    }

    // limpa seleção do combobox
    els.hiddenSel.value = CONFIG.placeholderValue;
    els.comboInput.value = "";
    openList(); filterList(""); closeList();
  }

  // ======================== INIT (eventos) ========================
  els.form.addEventListener("submit", onSubmit);

  // Combobox: abrir/filtrar/navegar
  els.comboInput.addEventListener("focus", () => { openList(); filterList(els.comboInput.value); });
  els.comboInput.addEventListener("click", ()  => { openList(); filterList(els.comboInput.value); });
  els.comboInput.addEventListener("input", (e) => {
    openList();
    filterList(e.target.value);
    Array.from(els.comboList.children).forEach(n => n.setAttribute("aria-selected","false"));
    const first = els.comboList.querySelector(".combo-option:not([hidden])");
    if (first) first.setAttribute("aria-selected","true");
  });
  els.comboInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown"){ e.preventDefault(); openList(); moveActive(+1); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); openList(); moveActive(-1); }
    else if (e.key === "Enter"){
      e.preventDefault();
      const sel = els.comboList.querySelector('.combo-option[aria-selected="true"]');
      const idx = sel ? Number(sel.dataset.index) : getFirstVisibleIndex();
      if (idx != null) selectByIndex(idx);
      // opcional: submeter automaticamente
      // els.form.requestSubmit();
    } else if (e.key === "Escape"){ closeList(); }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#comboOpcoes")) closeList();
  });

  // Carrega dados
  loadData()
    .then(() => setFeedback("Digite para filtrar e selecione um item, depois clique em Conferir."))
    .catch(err => { console.error(err); setFeedback("Erro ao carregar dados."); });
});
