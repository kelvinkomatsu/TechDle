document.addEventListener("DOMContentLoaded", () => {
  // Ordem das colunas (mantém as suas chaves de dados)
  const FIELD_KEYS = [
    "ITEM",
    "TIPO",
    "CONEXAO",
    "FUNCAO",
    "ENERGIA",
    "TIPO_DE_MEMORIA",
    "INSTALACAO",
    "TIPO_DE_TECNOLOGIA",
  ];

  // Config geral
  const CONFIG = {
    numericFields: [],   // ex.: ["ALTURA","PESO"] — vazio = sem setas
    prependRows: true    // novas tentativas no topo
  };

  const $  = (sel, ctx = document) => ctx.querySelector(sel);

  const opcoes        = $("#opcoes");
  const form          = $("#formGuess");
  const feedback      = $("#feedback");
  const tabelaWrapper = $("#tabelaWrapper");
  const tbody         = $("#tabelaResultados tbody");

  if (!opcoes || !form || !feedback || !tabelaWrapper || !tbody) {
    console.error("❌ IDs do HTML não encontrados.");
    return;
  }

  let resultados = [];
  let indiceAlvo = null;

  // 🔒 controle de repetidos e contador de tentativas
  const usados = new Set();  // guarda índices já tentados
  let tentativaN = 0;        // 1, 2, 3…

  function setFeedback(msg) { feedback.textContent = msg; }
  function mostrarTabela() { tabelaWrapper.hidden = false; }

  function criarOpcao(idx, label) {
    const op = document.createElement("option");
    op.value = String(idx);
    op.textContent = label;
    return op;
  }

  function parseNumero(str) {
    if (typeof str !== "string") return NaN;
    const s = str.replace(",", ".").match(/-?\d+(\.\d+)?/);
    return s ? parseFloat(s[0]) : NaN;
  }

  async function carregarDados() {
    const url = new URL("src/componentes.json", window.location.href).toString();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);
    const data = await res.json();

    resultados = Array.isArray(data) ? data : (data.resultados || []);
    if (!Array.isArray(resultados) || resultados.length === 0) {
      throw new Error("Estrutura de dados inválida ou vazia.");
    }

    resultados.forEach((item, idx) => {
      opcoes.appendChild(criarOpcao(idx, item.ITEM ?? `Item ${idx + 1}`));
    });

    indiceAlvo = Math.floor(Math.random() * resultados.length);
    setFeedback("Escolha um item e clique em Conferir.");
  }

  function montarLinhaTentativa(chute, alvo, numeroTentativa) {
    // conta acertos
    let acertos = 0;
    FIELD_KEYS.forEach(k => {
      if ((chute?.[k] ?? "") === (alvo?.[k] ?? "")) acertos++;
    });

    const total = FIELD_KEYS.length;
    const classeErro = acertos === 0 ? "cell-incorrect" : "cell-partial";

    const tr = document.createElement("tr");

    // Coluna 1: número da tentativa
    const tdNum = document.createElement("td");
    tdNum.textContent = String(numeroTentativa);
    tdNum.style.fontWeight = "700";
    tr.appendChild(tdNum);

    // Demais colunas
    FIELD_KEYS.forEach(k => {
      const valChute = chute?.[k] ?? "—";
      const valAlvo  = alvo?.[k]  ?? "—";
      const correto  = valChute === valAlvo;

      const td = document.createElement("td");
      td.textContent = valChute;
      td.classList.add(correto ? "cell-correct" : classeErro);

      if (!correto && CONFIG.numericFields.includes(k)) {
        const nChute = parseNumero(String(valChute));
        const nAlvo  = parseNumero(String(valAlvo));
        if (!Number.isNaN(nChute) && !Number.isNaN(nAlvo)) {
          if (nChute < nAlvo) td.classList.add("hint-up");
          else if (nChute > nAlvo) td.classList.add("hint-down");
        }
      }

      tr.appendChild(td);
    });

    if (CONFIG.prependRows && tbody.firstChild) {
      tbody.insertBefore(tr, tbody.firstChild);
    } else {
      tbody.appendChild(tr);
    }

    mostrarTabela();

    if (acertos === total) {
      setFeedback("✅ Acertou tudo! (acerto completo)");
    } else if (acertos === 0) {
      setFeedback("❌ Nenhum campo bateu. Tente novamente!");
    } else {
      setFeedback(`🟡 Parcial: ${acertos}/${total} campos corretos.`);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = opcoes.value;
    if (!raw) { setFeedback("Escolha um item antes de conferir."); return; }

    const idx = Number(raw);

    // 🔒 bloqueio contra repetição/injeção
    if (!Number.isInteger(idx) || idx < 0 || idx >= resultados.length) {
      setFeedback("Seleção inválida.");
      return;
    }
    if (usados.has(idx)) {
      setFeedback("⚠️ Esse item já foi tentado. Escolha outro.");
      return;
    }

    // marca como usado
    usados.add(idx);

    // remove a <option> correspondente (bloqueia nova seleção)
    const opt = opcoes.querySelector(`option[value="${idx}"]`);
    if (opt) opt.remove();

    // volta o select pro placeholder, se existir
    const placeholder = opcoes.querySelector('option[value=""]');
    if (placeholder) opcoes.value = "";

    // incrementa tentativa e cria linha
    tentativaN += 1;
    montarLinhaTentativa(resultados[idx], resultados[indiceAlvo], tentativaN);

    // Se acabaram as opções, desabilita form
    if (opcoes.options.length === 0 || (opcoes.options.length === 1 && opcoes.value === "")) {
      opcoes.disabled = true;
      const btn = e.submitter || form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      setFeedback("Fim das opções para tentar.");
    }
  });

  carregarDados().catch(err => {
    console.error(err);
    setFeedback("Erro ao carregar dados.");
  });
});
