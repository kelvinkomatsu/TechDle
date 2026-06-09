document.addEventListener("DOMContentLoaded", () => {
  // ======================== ESQUEMA DAS COLUNAS ========================
  // key: nome no JSON | labelShort/Long: só informativo (para UI futura) | partial: se aceita "acerto parcial"
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
    prependRows: true,               // novas tentativas entram no topo
    jsonPath: "src/componentes.json",
    placeholderValue: "",            // value do placeholder do <select>
  });

  // ======================== DOM & STATE ========================
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const els = {
    select:   $("#opcoes"),
    form:     $("#formGuess"),
    feedback: $("#feedback"),
    tableWrap:$("#tabelaWrapper"),
    tbody:    $("#tabelaResultados tbody"),
  };
  if (!els.select || !els.form || !els.feedback || !els.tableWrap || !els.tbody) {
    console.error("❌ IDs do HTML não encontrados.");
    return;
  }

  const state = {
    data: [],
    targetIndex: null,
    used: new Set(),
    attemptN: 0,
    gameOver: false,
  };

  // ======================== HELPERS (PUROS) ========================
  const stripDiacritics = s => String(s ?? "").normalize("NFD").replace(/\p{Diacritic}+/gu, "");
  const normalize = s => stripDiacritics(s).trim().replace(/\s+/g, " ").toLowerCase();
  const tokenize = s => {
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

  // ======================== UI HELPERS ========================
  const setFeedback = msg => { els.feedback.textContent = msg; };
  const showTable = () => { els.tableWrap.hidden = false; };

  function addOption(index, label) {
    const op = document.createElement("option");
    op.value = String(index);
    op.textContent = label ?? `Item ${index + 1}`;
    els.select.appendChild(op);
  }
  function resetSelectToPlaceholder() {
    const ph = els.select.querySelector(`option[value="${CONFIG.placeholderValue}"]`);
    if (ph) els.select.value = CONFIG.placeholderValue; else els.select.selectedIndex = -1;
  }
  function removeOptionByIndex(index) {
    const opt = els.select.querySelector(`option[value="${index}"]`);
    if (opt) opt.remove();
  }
  function disableForm() {
    els.select.disabled = true;
    const btn = els.form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
  }

  // ======================== LOAD DATA ========================
  async function loadData() {
    const url = new URL(CONFIG.jsonPath, window.location.href).toString();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);
    const json = await res.json();
    const arr = Array.isArray(json) ? json : (json.resultados || []);
    if (!Array.isArray(arr) || arr.length === 0) throw new Error("Estrutura de dados inválida ou vazia.");
    state.data = arr;

    arr.forEach((item, idx) => addOption(idx, item.ITEM));
    state.targetIndex = Math.floor(Math.random() * arr.length); // aleatório por enquanto
  }

  // ======================== RENDER ATTEMPT ========================
  function renderAttemptRow(guessObj, targetObj, attemptN) {
    let correctCount = 0;
    let partialCount = 0;

    const tr = document.createElement("tr");

    // # da tentativa
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

    // Estado visual da linha
    if (correctCount === FIELD_KEYS.length) tr.classList.add("row-complete");
    else if (correctCount === 0 && partialCount === 0) tr.classList.add("row-none");
    else tr.classList.add("row-partial");

    // Inserir no topo/base
    if (CONFIG.prependRows && els.tbody.firstChild) els.tbody.insertBefore(tr, els.tbody.firstChild);
    else els.tbody.appendChild(tr);

    showTable();

    // Retorna o resumo da jogada
    return { correctCount, partialCount, allCorrect: correctCount === FIELD_KEYS.length };
  }

  // ======================== SUBMIT ========================
  function onSubmit(e) {
    e.preventDefault();
    if (state.gameOver) return;

    const raw = els.select.value;
    if (!raw && raw !== "0") { setFeedback("Escolha um item antes de conferir."); return; }

    const idx = Number(raw);
    if (!Number.isInteger(idx) || idx < 0 || idx >= state.data.length) {
      setFeedback("Seleção inválida."); return;
    }
    if (state.used.has(idx)) { setFeedback("⚠️ Esse item já foi tentado. Escolha outro."); return; }

    // marca como usado e remove do seletor
    state.used.add(idx);
    removeOptionByIndex(idx);
    resetSelectToPlaceholder();

    state.attemptN += 1;

    const guess  = state.data[idx];
    const target = state.data[state.targetIndex];

    // renderiza e pega resumo
    const result = renderAttemptRow(guess, target, state.attemptN);

    // ✅ ENCERRA O JOGO SE O ITEM ESTIVER CERTO (índice bate)
    if (idx === state.targetIndex || result.allCorrect) {
      state.gameOver = true;
      disableForm();
      setFeedback("🏆 Você descobriu o item! Jogo encerrado.");
      return;
    }

    // Feedback quando não venceu
    if (result.correctCount === 0 && result.partialCount === 0) {
      setFeedback("❌ Nenhum campo bateu. Tente novamente!");
    } else {
      setFeedback(`🟡 Parcial: ${result.correctCount}/${FIELD_KEYS.length} corretos (${result.partialCount} parciais).`);
    }

    // Se esgotar opções, encerra também
    if (els.select.options.length === 0 ||
      (els.select.options.length === 1 && els.select.value === CONFIG.placeholderValue)) {
      disableForm();
      setFeedback("Fim das opções para tentar.");
    }
  }


  // ======================== INIT ========================
  els.form.addEventListener("submit", onSubmit);
  loadData()
    .then(() => setFeedback("Escolha um item e clique em Conferir."))
    .catch(err => { console.error(err); setFeedback("Erro ao carregar dados."); });
});
