/* ============================================
   TechDle v3.0 — Lógica do Jogo
   JavaScript (ES6+) Vanilla

   NOTA: Este jogo utiliza fetch() para carregar
   data/hardware.json. É necessário rodar via
   servidor local (ex.: Live Server no VS Code,
   python -m http.server, npx http-server).
   Abrir via file:// causará erro de CORS.
   ============================================ */

// ============================================================
// SEÇÃO 1 — CONSTANTES E CONFIGURAÇÃO
// ============================================================

const STORAGE_KEYS = {
  SESSAO: 'techdle_sessao',
  STREAK: 'techdle_streak'
};

const MODOS = { DIARIO: 'diario', PRATICA: 'pratica' };

const STATUS_CLASSE = {
  'correct': 'cell-correct',
  'partial': 'cell-partial',
  'wrong':   'cell-wrong'
};

const STATUS_EMOJI = {
  'correct': '🟩',
  'partial': '🟨',
  'wrong':   '🟥'
};

const CAMPOS_ORDEM = ['item', 'tipo', 'conexao', 'funcao', 'energia', 'tipoMemoria', 'instalacao', 'tecnologias'];

const CAMPOS_LABELS = {
  item:         'Item',
  tipo:         'Tipo',
  conexao:      'Conexão',
  funcao:       'Função',
  energia:      'Energia',
  tipoMemoria:  'Memória',
  instalacao:   'Instalação',
  tecnologias:  'Tecnologias'
};

const STATUS_LABELS = {
  'correct': 'Correto',
  'partial': 'Parcial',
  'wrong':   'Incorreto'
};

const NOMES_MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const NOMES_DIAS = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

// ============================================================
// SEÇÃO 1.1 — ESTADO GLOBAL
// ============================================================

let dadosHardware = [];

// Estado do modo diário
let diario = {
  itemDoDia: null,
  tentativas: [],       // nomes dos itens chutados
  resultados: [],       // array de objetos resultado por tentativa
  concluida: false,
  resultado: null       // 'acerto' | 'desistencia' | null
};

// Estado do modo prática
let pratica = {
  itemAlvo: null,
  tentativas: [],
  resultados: [],
  rodadaAtual: 1,
  concluida: false
};

// ============================================================
// SEÇÃO 2 — DADOS
// ============================================================

/**
 * Carrega o dataset de hardware a partir do arquivo JSON.
 * @returns {Promise<Array>} Array de objetos representando os itens do dataset.
 */
async function carregarDados() {
  const response = await fetch('data/hardware.json');
  if (!response.ok) {
    throw new Error('Erro ao carregar dados do hardware.');
  }
  return response.json();
}

/**
 * Determina o item do dia com base na data atual.
 * @param {Array} items - Array completo de itens do dataset.
 * @returns {Object} O item selecionado para o dia atual.
 */
function getItemDoDia(items) {
  const hoje = new Date();
  const seed = hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate();
  const index = seed % items.length;
  return items[index];
}

/**
 * Seleciona um item aleatório do dataset, opcionalmente excluindo itens já usados.
 * @param {Array} items - Array completo de itens.
 * @param {Array} excluir - Nomes de itens a excluir.
 * @returns {Object} Item aleatório.
 */
function getItemAleatorio(items, excluir = []) {
  const disponiveis = items.filter(item =>
    !excluir.some(e => e.toLowerCase() === item.item.toLowerCase())
  );
  if (disponiveis.length === 0) return items[Math.floor(Math.random() * items.length)];
  return disponiveis[Math.floor(Math.random() * disponiveis.length)];
}

// ============================================================
// SEÇÃO 3 — LOCALSTORAGE: SESSÃO DIÁRIA
// ============================================================

/**
 * Carrega a sessão salva do localStorage.
 * @returns {Object|null} Objeto sessão ou null.
 */
function carregarSessao() {
  const dados = localStorage.getItem(STORAGE_KEYS.SESSAO);
  if (!dados) return null;
  try {
    return JSON.parse(dados);
  } catch (e) {
    localStorage.removeItem(STORAGE_KEYS.SESSAO);
    return null;
  }
}

/**
 * Salva a sessão no localStorage.
 * @param {Object} sessao - Objeto da sessão.
 */
function salvarSessao(sessao) {
  localStorage.setItem(STORAGE_KEYS.SESSAO, JSON.stringify(sessao));
}

/**
 * Verifica se a sessão é do dia atual.
 * @param {Object} sessao - Objeto da sessão.
 * @returns {boolean}
 */
function sessaoEhDeHoje(sessao) {
  return sessao && sessao.data === dataHoje();
}

/**
 * Cria um objeto de sessão nova para o dia atual.
 * @returns {Object}
 */
function iniciarNovaSessao() {
  return {
    data: dataHoje(),
    modoAtivo: 'hardware',
    tentativas: [],
    resultados: [],
    concluida: false,
    resultado: null
  };
}

/**
 * Restaura as tentativas de uma sessão anterior no grid.
 * @param {Object} sessao - Sessão salva.
 * @param {Array} items - Dataset completo.
 */
function restaurarSessaoDiario(sessao, items) {
  if (!sessao.tentativas || sessao.tentativas.length === 0) return;

  const itemCorreto = diario.itemDoDia;
  for (const nomeTentativa of sessao.tentativas) {
    const itemEncontrado = items.find(
      item => item.item.toLowerCase() === nomeTentativa.toLowerCase()
    );
    if (itemEncontrado) {
      diario.tentativas.push(itemEncontrado.item);
      const resultado = processarTentativa(itemEncontrado, itemCorreto);
      diario.resultados.push(resultado);
      const tr = criarLinhaResultado(itemEncontrado, resultado, false);
      adicionarLinhaAoGrid(tr, 'diario-tbody');
    }
  }
  atualizarContador('diario-contador', diario.tentativas.length);

  // Mostrar botão desistir se houver tentativas
  if (diario.tentativas.length > 0 && !sessao.concluida) {
    document.getElementById('diario-btn-desistir').classList.add('btn-desistir--visivel');
  }

  // Restaurar estado concluído
  if (sessao.concluida) {
    diario.concluida = true;
    diario.resultado = sessao.resultado;
    diario.resultados = sessao.resultados || diario.resultados;

    desabilitarInputDiario();
    exibirPainelResultado(
      diario.itemDoDia,
      diario.tentativas,
      diario.resultados,
      sessao.resultado,
      'diario'
    );
  }
}

// ============================================================
// SEÇÃO 4 — LOCALSTORAGE: STREAK
// ============================================================

/**
 * Carrega o objeto streak do localStorage.
 * @returns {Object} Objeto streak com valores default se inexistente.
 */
function carregarStreak() {
  const dados = localStorage.getItem(STORAGE_KEYS.STREAK);
  if (!dados) {
    return { diasConsecutivos: 0, ultimoDiaJogado: null, recordePessoal: 0 };
  }
  try {
    return JSON.parse(dados);
  } catch (e) {
    return { diasConsecutivos: 0, ultimoDiaJogado: null, recordePessoal: 0 };
  }
}

/**
 * Salva o objeto streak no localStorage.
 * @param {Object} streak
 */
function salvarStreak(streak) {
  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
}

/**
 * Atualiza o streak ao concluir uma sessão diária.
 */
function atualizarStreak() {
  const streak = carregarStreak();
  const hoje = dataHoje();

  if (streak.ultimoDiaJogado === hoje) {
    return; // Já atualizado hoje
  }

  const ontem = dataOntem();

  if (streak.ultimoDiaJogado === ontem) {
    streak.diasConsecutivos += 1;
  } else {
    streak.diasConsecutivos = 1;
  }

  streak.ultimoDiaJogado = hoje;

  if (streak.diasConsecutivos > streak.recordePessoal) {
    streak.recordePessoal = streak.diasConsecutivos;
  }

  salvarStreak(streak);
}

/**
 * Atualiza os elementos DOM que exibem o streak.
 */
function exibirStreak() {
  const streak = carregarStreak();

  // Home
  const homeTexto = document.getElementById('home-streak-texto');
  if (homeTexto) {
    if (streak.diasConsecutivos > 0) {
      homeTexto.textContent = streak.diasConsecutivos + (streak.diasConsecutivos === 1 ? ' dia seguido' : ' dias seguidos') +
        ' (recorde: ' + streak.recordePessoal + ')';
    } else {
      homeTexto.textContent = 'Comece sua sequência hoje!';
    }
  }

  // Tela diário
  const diarioStreak = document.getElementById('diario-streak');
  if (diarioStreak) {
    if (streak.diasConsecutivos > 0) {
      diarioStreak.textContent = '🔥 ' + streak.diasConsecutivos + (streak.diasConsecutivos === 1 ? ' dia seguido' : ' dias seguidos');
    } else {
      diarioStreak.textContent = '';
    }
  }
}

// ============================================================
// SEÇÃO 5 — ALGORITMO DE COMPARAÇÃO (preservado da v2.0)
// ============================================================

/**
 * Normaliza um valor para sempre ser tratado como array.
 * @param {*} valor - O valor a ser normalizado.
 * @returns {Array} O valor como array.
 */
function normalizarArray(valor) {
  if (Array.isArray(valor)) {
    return valor;
  }
  if (valor === null || valor === undefined) {
    return [];
  }
  return [String(valor)];
}

/**
 * Compara o valor de um campo do item chutado com o valor do item correto.
 * Retorna 'correct', 'partial' ou 'wrong' de acordo com o algoritmo v2.0.
 *
 * Regras:
 * - Arrays idênticos (mesmos elementos) → correct
 * - Interseção não vazia, mas conjuntos diferentes → partial
 * - Sem interseção → wrong
 * - ["X"] vs ["X"] → correct
 * - ["X"] vs outro / outro vs ["X"] → wrong
 *
 * @param {Array} chutado - Valores do campo do item chutado.
 * @param {Array} correto - Valores do campo do item correto.
 * @returns {string} 'correct' | 'partial' | 'wrong'
 */
function compararCampo(chutado, correto) {
  const arrChutado = normalizarArray(chutado);
  const arrCorreto = normalizarArray(correto);

  const setChutado = new Set(arrChutado);
  const setCorreto = new Set(arrCorreto);

  // Tratamento especial do valor "X"
  const chutadoEhX = setChutado.size === 1 && setChutado.has('X');
  const corretoEhX = setCorreto.size === 1 && setCorreto.has('X');

  if (chutadoEhX && corretoEhX) {
    return 'correct';
  }
  if (chutadoEhX || corretoEhX) {
    return 'wrong';
  }

  // Verifica se os conjuntos são idênticos
  if (setChutado.size === setCorreto.size) {
    let todosIguais = true;
    for (const val of setChutado) {
      if (!setCorreto.has(val)) {
        todosIguais = false;
        break;
      }
    }
    if (todosIguais) {
      return 'correct';
    }
  }

  // Verifica interseção
  for (const val of setChutado) {
    if (setCorreto.has(val)) {
      return 'partial';
    }
  }

  return 'wrong';
}

/**
 * Processa uma tentativa completa, comparando cada campo do item chutado com o item correto.
 * @param {Object} itemChutado - O item que o jogador chutou.
 * @param {Object} itemCorreto - O item do dia (resposta correta).
 * @returns {Object} Objeto com resultado por campo.
 */
function processarTentativa(itemChutado, itemCorreto) {
  const resultado = {};

  // Campo item — comparação exata por string
  resultado.item = (itemChutado.item === itemCorreto.item) ? 'correct' : 'wrong';

  // Campos de array — comparação por conjuntos
  const camposArray = ['tipo', 'conexao', 'funcao', 'energia', 'tipoMemoria', 'instalacao', 'tecnologias'];
  for (const campo of camposArray) {
    resultado[campo] = compararCampo(itemChutado[campo], itemCorreto[campo]);
  }

  return resultado;
}

// ============================================================
// SEÇÃO 6 — AUTOCOMPLETE
// ============================================================

/**
 * Filtra os itens do dataset pelo nome.
 * @param {string} texto - Texto digitado pelo jogador.
 * @param {Array} items - Array completo de itens.
 * @param {Array} jaChutados - Nomes de itens já chutados.
 * @returns {Array} Itens filtrados.
 */
function filtrarSugestoes(texto, items, jaChutados) {
  if (!texto || texto.trim().length === 0) {
    return [];
  }
  const busca = texto.toLowerCase().trim();
  return items.filter(item => item.item.toLowerCase().includes(busca));
}

/**
 * Renderiza a lista suspensa de sugestões no DOM.
 * @param {Array} sugestoes - Itens filtrados.
 * @param {string} listaId - ID do elemento UL.
 * @param {string} inputId - ID do elemento input.
 * @param {Array} jaChutados - Nomes de itens já chutados.
 */
function renderizarSugestoes(sugestoes, listaId, inputId, jaChutados) {
  const lista = document.getElementById(listaId);
  lista.textContent = '';

  sugestoes.forEach(item => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    const jaUsado = jaChutados.some(t => t.toLowerCase() === item.item.toLowerCase());

    if (jaUsado) {
      li.classList.add('autocomplete-item', 'autocomplete-item--disabled');
      li.textContent = item.item + ' (já chutado)';
    } else {
      li.classList.add('autocomplete-item');
      li.textContent = item.item;
      li.addEventListener('click', () => {
        const inputEl = document.getElementById(inputId);
        inputEl.value = item.item;
        fecharSugestoes(listaId);
        inputEl.focus();
      });
    }

    lista.appendChild(li);
  });
}

/**
 * Fecha a lista de autocomplete.
 * @param {string} listaId - ID do elemento UL.
 */
function fecharSugestoes(listaId) {
  const lista = document.getElementById(listaId);
  lista.textContent = '';
}

// ============================================================
// SEÇÃO 7 — GRID DE TENTATIVAS
// ============================================================

/**
 * Renderiza uma célula da tabela com classe de coluna fixa e tooltip.
 * @param {Array} valores - Valores do campo.
 * @param {string} status - 'correct' | 'partial' | 'wrong'.
 * @param {string} campoNome - Nome do campo para classe de coluna.
 * @returns {HTMLTableCellElement}
 */
function renderizarCelula(valores, status, campoNome) {
  const td = document.createElement('td');
  td.classList.add(STATUS_CLASSE[status], 'celula-tentativa');

  // Adicionar classe de coluna para largura fixa
  const colClasses = {
    item: 'col-item', tipo: 'col-tipo', conexao: 'col-conexao',
    funcao: 'col-funcao', energia: 'col-energia', tipoMemoria: 'col-memoria',
    instalacao: 'col-instalacao', tecnologias: 'col-tecnologias'
  };
  if (colClasses[campoNome]) {
    td.classList.add(colClasses[campoNome]);
  }

  const arr = normalizarArray(valores);
  const textoExibicao = arr.join(', ');
  td.textContent = textoExibicao;

  // Tooltip com valor + status para acessibilidade (F1 + acessibilidade)
  td.title = textoExibicao + ' — ' + STATUS_LABELS[status];

  return td;
}

/**
 * Cria uma linha completa de resultado.
 * @param {Object} itemChutado - Item chutado.
 * @param {Object} resultado - Resultado da comparação.
 * @param {boolean} animar - Se deve aplicar animação de entrada.
 * @returns {HTMLTableRowElement}
 */
function criarLinhaResultado(itemChutado, resultado, animar = true) {
  const tr = document.createElement('tr');
  if (animar) {
    tr.classList.add('linha-resultado');
  }

  for (const campo of CAMPOS_ORDEM) {
    let valores;
    if (campo === 'item') {
      valores = [itemChutado.item];
    } else {
      valores = itemChutado[campo];
    }
    const td = renderizarCelula(valores, resultado[campo], campo);

    // Se restaurando sem animação, forçar visibilidade
    if (!animar) {
      td.style.opacity = '1';
      td.style.animation = 'none';
    }

    tr.appendChild(td);
  }

  return tr;
}

/**
 * Adiciona uma linha ao tbody especificado.
 * @param {HTMLTableRowElement} tr - Linha a adicionar.
 * @param {string} tbodyId - ID do tbody.
 */
function adicionarLinhaAoGrid(tr, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (tbody.firstChild) {
    tbody.insertBefore(tr, tbody.firstChild);
  } else {
    tbody.appendChild(tr);
  }
}

// ============================================================
// SEÇÃO 8 — PAINEL DE RESULTADO (ficha técnica + compartilhar)
// ============================================================

/**
 * Exibe o painel de resultado com ficha técnica do item.
 * @param {Object} item - Item revelado.
 * @param {Array} tentativasNomes - Lista de nomes chutados.
 * @param {Array} resultados - Lista de resultados por tentativa.
 * @param {string} tipoResultado - 'acerto' | 'desistencia'.
 * @param {string} modo - 'diario' | 'pratica'.
 */
function exibirPainelResultado(item, tentativasNomes, resultados, tipoResultado, modo) {
  const painel = document.getElementById(modo + '-painel-resultado');
  const statusEl = document.getElementById(modo + '-resultado-status');
  const fichaEl = document.getElementById(modo + '-ficha');

  // Status
  if (tipoResultado === 'acerto') {
    statusEl.textContent = '🎉 Parabéns! Você acertou em ' + tentativasNomes.length +
      (tentativasNomes.length === 1 ? ' tentativa!' : ' tentativas!');
    statusEl.className = 'painel-resultado__status painel-resultado__status--acerto';
  } else {
    statusEl.textContent = '😔 Você desistiu. O item era: ' + item.item;
    statusEl.className = 'painel-resultado__status painel-resultado__status--desistencia';
  }

  // Ficha técnica
  fichaEl.textContent = '';

  const nomeEl = document.createElement('div');
  nomeEl.classList.add('painel-resultado__item-nome');
  nomeEl.textContent = '🖥️ ' + item.item;
  fichaEl.appendChild(nomeEl);

  const tipoEl = document.createElement('div');
  tipoEl.classList.add('painel-resultado__item-tipo');
  tipoEl.textContent = normalizarArray(item.tipo).join(' • ');
  fichaEl.appendChild(tipoEl);

  if (item.descricao) {
    const descEl = document.createElement('div');
    descEl.classList.add('painel-resultado__descricao');
    descEl.textContent = item.descricao;
    fichaEl.appendChild(descEl);
  }

  const detalhesEl = document.createElement('div');
  detalhesEl.classList.add('painel-resultado__detalhes');

  const camposDetalhes = [
    { label: 'Conexões', campo: 'conexao' },
    { label: 'Função', campo: 'funcao' },
    { label: 'Energia', campo: 'energia' },
    { label: 'Memória', campo: 'tipoMemoria' },
    { label: 'Instalação', campo: 'instalacao' },
    { label: 'Tecnologias', campo: 'tecnologias' }
  ];

  for (const det of camposDetalhes) {
    const val = normalizarArray(item[det.campo]).join(', ');
    if (val === 'X') continue;

    const detalheEl = document.createElement('div');
    detalheEl.classList.add('painel-resultado__detalhe');

    const labelEl = document.createElement('div');
    labelEl.classList.add('painel-resultado__detalhe-label');
    labelEl.textContent = det.label;
    detalheEl.appendChild(labelEl);

    const valorEl = document.createElement('div');
    valorEl.classList.add('painel-resultado__detalhe-valor');
    valorEl.textContent = val;
    detalheEl.appendChild(valorEl);

    detalhesEl.appendChild(detalheEl);
  }

  fichaEl.appendChild(detalhesEl);

  painel.classList.add('painel-resultado--visivel');
}

/**
 * Gera o texto de compartilhamento com emojis.
 * @param {Array} tentativasNomes - Nomes dos itens chutados.
 * @param {Array} resultados - Array de objetos de resultado.
 * @param {Object} streak - Objeto streak.
 * @param {string} tipoResultado - 'acerto' | 'desistencia'.
 * @returns {string}
 */
function gerarTextoCompartilhar(tentativasNomes, resultados, streak, tipoResultado) {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();

  let texto = 'TechDle — Modo Hardware 🖥️\n';
  texto += '📅 ' + dia + '/' + mes + '/' + ano;
  if (streak.diasConsecutivos > 0) {
    texto += ' | 🔥 ' + streak.diasConsecutivos + ' dias seguidos';
  }
  texto += '\n\n';

  for (let i = 0; i < resultados.length; i++) {
    const res = resultados[i];
    let linha = 'Tentativa ' + (i + 1) + ': ';
    for (const campo of CAMPOS_ORDEM) {
      linha += STATUS_EMOJI[res[campo]];
    }
    // Marcar acerto ou desistência na última linha
    if (i === resultados.length - 1) {
      if (tipoResultado === 'acerto') {
        linha += ' ✅';
      } else {
        linha += ' ❌';
      }
    }
    texto += linha + '\n';
  }

  texto += '\ntechdle.com.br';
  return texto;
}

/**
 * Copia texto para a área de transferência com fallback.
 * @param {string} texto - Texto a copiar.
 * @param {string} feedbackId - ID do elemento de feedback.
 */
function copiarParaClipboard(texto, feedbackId) {
  const feedbackEl = document.getElementById(feedbackId);

  const copiar = () => {
    feedbackEl.classList.add('feedback-copiado--visivel');
    setTimeout(() => {
      feedbackEl.classList.remove('feedback-copiado--visivel');
    }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(copiar).catch(() => {
      copiarFallback(texto);
      copiar();
    });
  } else {
    copiarFallback(texto);
    copiar();
  }
}

/**
 * Fallback para copiar texto usando execCommand.
 * @param {string} texto
 */
function copiarFallback(texto) {
  const textarea = document.createElement('textarea');
  textarea.value = texto;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// ============================================================
// SEÇÃO 9 — NAVEGAÇÃO ENTRE TELAS
// ============================================================

/**
 * Mostra a tela com o ID informado, escondendo todas as outras.
 * @param {string} id - ID da tela a exibir.
 */
function mostrarTela(id) {
  const telas = document.querySelectorAll('.tela');
  telas.forEach(tela => tela.classList.remove('tela--ativa'));
  document.getElementById(id).classList.add('tela--ativa');
  window.scrollTo(0, 0);
}

function irParaHome() {
  exibirStreak();
  mostrarTela('tela-home');
}

function irParaDiario() {
  mostrarTela('tela-diario');
}

function irParaPratica() {
  mostrarTela('tela-pratica');
}

// ============================================================
// SEÇÃO 10 — MODO DIÁRIO
// ============================================================

/**
 * Inicializa o modo diário: define item do dia, restaura sessão, configura listeners.
 * @param {Array} items - Dataset completo.
 */
function inicializarDiario(items) {
  diario.itemDoDia = getItemDoDia(items);

  // Data formatada
  document.getElementById('diario-data').textContent = dataFormatada();

  // Carregar sessão
  const sessao = carregarSessao();
  if (sessao && sessaoEhDeHoje(sessao)) {
    restaurarSessaoDiario(sessao, items);
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSAO);
  }

  // Se sessão já concluída, mostrar mensagem
  if (diario.concluida) {
    mostrarMensagemSessaoEncerrada();
  }

  // Listeners
  const inputEl = document.getElementById('diario-input');
  const btnAdivinhar = document.getElementById('diario-btn-adivinhar');
  const btnDesistir = document.getElementById('diario-btn-desistir');

  inputEl.addEventListener('input', () => {
    const texto = inputEl.value;
    if (texto.trim().length === 0) {
      fecharSugestoes('diario-autocomplete');
      return;
    }
    const sugestoes = filtrarSugestoes(texto, items, diario.tentativas);
    renderizarSugestoes(sugestoes, 'diario-autocomplete', 'diario-input', diario.tentativas);
  });

  btnAdivinhar.addEventListener('click', () => {
    if (diario.concluida) return;
    processarChuteDiario(inputEl.value, items);
  });

  btnDesistir.addEventListener('click', () => {
    if (diario.concluida) return;
    concluirSessaoDiaria('desistencia');
  });

  // Keyboard: arrows + enter
  inputEl.addEventListener('keydown', (e) => {
    const lista = document.getElementById('diario-autocomplete');
    const listaItems = lista.querySelectorAll('.autocomplete-item:not(.autocomplete-item--disabled)');

    let activeIndex = -1;
    listaItems.forEach((item, index) => {
      if (item.classList.contains('autocomplete-item--active')) {
        activeIndex = index;
      }
    });

    if (e.key === 'ArrowDown' && listaItems.length > 0) {
      e.preventDefault();
      if (activeIndex >= 0) listaItems[activeIndex].classList.remove('autocomplete-item--active');
      activeIndex = (activeIndex + 1) % listaItems.length;
      listaItems[activeIndex].classList.add('autocomplete-item--active');
      listaItems[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp' && listaItems.length > 0) {
      e.preventDefault();
      if (activeIndex >= 0) listaItems[activeIndex].classList.remove('autocomplete-item--active');
      activeIndex = activeIndex <= 0 ? listaItems.length - 1 : activeIndex - 1;
      listaItems[activeIndex].classList.add('autocomplete-item--active');
      listaItems[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && listaItems.length > 0) {
        inputEl.value = listaItems[activeIndex].textContent;
        fecharSugestoes('diario-autocomplete');
      } else {
        if (diario.concluida) return;
        processarChuteDiario(inputEl.value, items);
      }
    }
  });

  // Fechar autocomplete ao clicar fora
  document.addEventListener('click', (e) => {
    const section = document.getElementById('diario-input-section');
    if (!section.contains(e.target)) {
      fecharSugestoes('diario-autocomplete');
    }
  });
}

/**
 * Processa um chute no modo diário.
 * @param {string} nomeItem - Nome digitado.
 * @param {Array} items - Dataset.
 */
function processarChuteDiario(nomeItem, items) {
  if (!nomeItem || nomeItem.trim().length === 0) {
    exibirMensagemErro('Digite o nome de um componente para adivinhar.', 'diario-erro');
    return;
  }

  const nomeLimpo = nomeItem.trim();
  const itemEncontrado = items.find(
    item => item.item.toLowerCase() === nomeLimpo.toLowerCase()
  );

  if (!itemEncontrado) {
    exibirMensagemErro('Item não encontrado no dataset. Selecione um item da lista.', 'diario-erro');
    return;
  }

  const jaChutado = diario.tentativas.some(
    t => t.toLowerCase() === itemEncontrado.item.toLowerCase()
  );

  if (jaChutado) {
    exibirMensagemErro('Você já tentou esse item. Escolha outro!', 'diario-erro');
    return;
  }

  // Registrar
  diario.tentativas.push(itemEncontrado.item);
  const resultado = processarTentativa(itemEncontrado, diario.itemDoDia);
  diario.resultados.push(resultado);

  // Renderizar
  const tr = criarLinhaResultado(itemEncontrado, resultado, true);
  adicionarLinhaAoGrid(tr, 'diario-tbody');
  atualizarContador('diario-contador', diario.tentativas.length);

  // Limpar input
  const inputEl = document.getElementById('diario-input');
  inputEl.value = '';
  fecharSugestoes('diario-autocomplete');

  // Mostrar botão desistir após 1ª tentativa
  document.getElementById('diario-btn-desistir').classList.add('btn-desistir--visivel');

  // Salvar progresso
  salvarProgressoDiario();

  // Verificar vitória
  if (itemEncontrado.item === diario.itemDoDia.item) {
    concluirSessaoDiaria('acerto');
  }
}

/**
 * Conclui a sessão diária (acerto ou desistência).
 * @param {string} resultado - 'acerto' | 'desistencia'.
 */
function concluirSessaoDiaria(resultado) {
  diario.concluida = true;
  diario.resultado = resultado;

  // Atualizar streak
  atualizarStreak();
  exibirStreak();

  // Desabilitar input
  desabilitarInputDiario();

  // Salvar sessão
  salvarProgressoDiario();

  // Exibir painel de resultado
  exibirPainelResultado(
    diario.itemDoDia,
    diario.tentativas,
    diario.resultados,
    resultado,
    'diario'
  );

  // Mensagem de sessão encerrada
  mostrarMensagemSessaoEncerrada();
}

/**
 * Salva o progresso diário no localStorage.
 */
function salvarProgressoDiario() {
  const sessao = {
    data: dataHoje(),
    modoAtivo: 'hardware',
    tentativas: diario.tentativas,
    resultados: diario.resultados,
    concluida: diario.concluida,
    resultado: diario.resultado
  };
  salvarSessao(sessao);
}

/**
 * Desabilita o input e botões do modo diário.
 */
function desabilitarInputDiario() {
  const inputEl = document.getElementById('diario-input');
  const btnAdiv = document.getElementById('diario-btn-adivinhar');
  const btnDesistir = document.getElementById('diario-btn-desistir');
  inputEl.disabled = true;
  btnAdiv.disabled = true;
  btnDesistir.style.display = 'none';
  inputEl.placeholder = 'Sessão encerrada — volte amanhã!';
  fecharSugestoes('diario-autocomplete');
}

/**
 * Mostra mensagem informando quando o próximo item estará disponível.
 */
function mostrarMensagemSessaoEncerrada() {
  const msgEl = document.getElementById('diario-msg-encerrada');
  const agora = new Date();
  const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 0, 0);
  const diffMs = amanha - agora;
  const horas = Math.floor(diffMs / (1000 * 60 * 60));
  const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const tipoTexto = diario.resultado === 'acerto' ? '🎉 Você acertou hoje!' : '😔 Você desistiu hoje.';
  msgEl.textContent = tipoTexto + ' Próximo item em ~' + horas + 'h' + minutos + 'min.';
  msgEl.classList.add('msg-sessao-encerrada--visivel');

  document.getElementById('diario-status-hint').textContent = 'Volte amanhã para um novo desafio!';
}

// ============================================================
// SEÇÃO 11 — MODO PRÁTICA
// ============================================================

/**
 * Inicializa o modo prática.
 * @param {Array} items - Dataset completo.
 */
function inicializarPratica(items) {
  pratica.itemAlvo = getItemAleatorio(items);
  pratica.tentativas = [];
  pratica.resultados = [];
  pratica.concluida = false;
  pratica.rodadaAtual = 1;

  atualizarRodadaPratica();
  atualizarContador('pratica-contador', 0);

  // Limpar grid
  document.getElementById('pratica-tbody').textContent = '';
  document.getElementById('pratica-painel-resultado').classList.remove('painel-resultado--visivel');

  // Habilitar input
  const inputEl = document.getElementById('pratica-input');
  const btnAdiv = document.getElementById('pratica-btn-adivinhar');
  inputEl.disabled = false;
  btnAdiv.disabled = false;
  inputEl.placeholder = 'Digite o nome de um componente...';
  inputEl.value = '';
  inputEl.focus();

  document.getElementById('pratica-status-hint').textContent = 'Adivinhe o hardware!';
}

/**
 * Configura os listeners do modo prática (chamado uma vez).
 * @param {Array} items - Dataset.
 */
function configurarListenersPratica(items) {
  const inputEl = document.getElementById('pratica-input');
  const btnAdiv = document.getElementById('pratica-btn-adivinhar');
  const btnNovaRodada = document.getElementById('pratica-btn-nova-rodada');

  inputEl.addEventListener('input', () => {
    const texto = inputEl.value;
    if (texto.trim().length === 0) {
      fecharSugestoes('pratica-autocomplete');
      return;
    }
    const sugestoes = filtrarSugestoes(texto, items, pratica.tentativas);
    renderizarSugestoes(sugestoes, 'pratica-autocomplete', 'pratica-input', pratica.tentativas);
  });

  btnAdiv.addEventListener('click', () => {
    if (pratica.concluida) return;
    processarChutePratica(inputEl.value, items);
  });

  btnNovaRodada.addEventListener('click', () => {
    novaRodadaPratica(items);
  });

  inputEl.addEventListener('keydown', (e) => {
    const lista = document.getElementById('pratica-autocomplete');
    const listaItems = lista.querySelectorAll('.autocomplete-item:not(.autocomplete-item--disabled)');

    let activeIndex = -1;
    listaItems.forEach((item, index) => {
      if (item.classList.contains('autocomplete-item--active')) {
        activeIndex = index;
      }
    });

    if (e.key === 'ArrowDown' && listaItems.length > 0) {
      e.preventDefault();
      if (activeIndex >= 0) listaItems[activeIndex].classList.remove('autocomplete-item--active');
      activeIndex = (activeIndex + 1) % listaItems.length;
      listaItems[activeIndex].classList.add('autocomplete-item--active');
      listaItems[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp' && listaItems.length > 0) {
      e.preventDefault();
      if (activeIndex >= 0) listaItems[activeIndex].classList.remove('autocomplete-item--active');
      activeIndex = activeIndex <= 0 ? listaItems.length - 1 : activeIndex - 1;
      listaItems[activeIndex].classList.add('autocomplete-item--active');
      listaItems[activeIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && listaItems.length > 0) {
        inputEl.value = listaItems[activeIndex].textContent;
        fecharSugestoes('pratica-autocomplete');
      } else {
        if (pratica.concluida) return;
        processarChutePratica(inputEl.value, items);
      }
    }
  });

  document.addEventListener('click', (e) => {
    const section = document.getElementById('pratica-input-section');
    if (!section.contains(e.target)) {
      fecharSugestoes('pratica-autocomplete');
    }
  });
}

/**
 * Processa um chute no modo prática.
 * @param {string} nomeItem - Nome digitado.
 * @param {Array} items - Dataset.
 */
function processarChutePratica(nomeItem, items) {
  if (!nomeItem || nomeItem.trim().length === 0) {
    exibirMensagemErro('Digite o nome de um componente para adivinhar.', 'pratica-erro');
    return;
  }

  const nomeLimpo = nomeItem.trim();
  const itemEncontrado = items.find(
    item => item.item.toLowerCase() === nomeLimpo.toLowerCase()
  );

  if (!itemEncontrado) {
    exibirMensagemErro('Item não encontrado no dataset. Selecione um item da lista.', 'pratica-erro');
    return;
  }

  const jaChutado = pratica.tentativas.some(
    t => t.toLowerCase() === itemEncontrado.item.toLowerCase()
  );

  if (jaChutado) {
    exibirMensagemErro('Você já tentou esse item. Escolha outro!', 'pratica-erro');
    return;
  }

  // Registrar
  pratica.tentativas.push(itemEncontrado.item);
  const resultado = processarTentativa(itemEncontrado, pratica.itemAlvo);
  pratica.resultados.push(resultado);

  // Renderizar
  const tr = criarLinhaResultado(itemEncontrado, resultado, true);
  adicionarLinhaAoGrid(tr, 'pratica-tbody');
  atualizarContador('pratica-contador', pratica.tentativas.length);

  // Limpar input
  const inputEl = document.getElementById('pratica-input');
  inputEl.value = '';
  fecharSugestoes('pratica-autocomplete');

  // Verificar acerto
  if (itemEncontrado.item === pratica.itemAlvo.item) {
    pratica.concluida = true;
    inputEl.disabled = true;
    document.getElementById('pratica-btn-adivinhar').disabled = true;
    inputEl.placeholder = 'Acertou! Clique em "Nova Rodada"';
    document.getElementById('pratica-status-hint').textContent = '🎉 Acertou!';

    exibirPainelResultado(
      pratica.itemAlvo,
      pratica.tentativas,
      pratica.resultados,
      'acerto',
      'pratica'
    );
  }
}

/**
 * Inicia uma nova rodada no modo prática.
 * @param {Array} items - Dataset.
 */
function novaRodadaPratica(items) {
  pratica.rodadaAtual += 1;
  pratica.itemAlvo = getItemAleatorio(items);
  pratica.tentativas = [];
  pratica.resultados = [];
  pratica.concluida = false;

  atualizarRodadaPratica();
  atualizarContador('pratica-contador', 0);

  document.getElementById('pratica-tbody').textContent = '';
  document.getElementById('pratica-painel-resultado').classList.remove('painel-resultado--visivel');

  const inputEl = document.getElementById('pratica-input');
  const btnAdiv = document.getElementById('pratica-btn-adivinhar');
  inputEl.disabled = false;
  btnAdiv.disabled = false;
  inputEl.placeholder = 'Digite o nome de um componente...';
  inputEl.value = '';
  inputEl.focus();

  document.getElementById('pratica-status-hint').textContent = 'Adivinhe o hardware!';
}

/**
 * Atualiza o texto da rodada atual no modo prática.
 */
function atualizarRodadaPratica() {
  document.getElementById('pratica-rodada').textContent =
    'Rodada ' + pratica.rodadaAtual + ' da sessão';
}

// ============================================================
// SEÇÃO 12 — UTILITÁRIOS
// ============================================================

/**
 * Retorna a data de hoje no formato YYYY-MM-DD.
 * @returns {string}
 */
function dataHoje() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * Retorna a data de ontem no formato YYYY-MM-DD.
 * @returns {string}
 */
function dataOntem() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * Retorna a data formatada: "Segunda-feira, 08 de junho de 2026".
 * @returns {string}
 */
function dataFormatada() {
  const d = new Date();
  const diaSemana = NOMES_DIAS[d.getDay()];
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = NOMES_MESES[d.getMonth()];
  const ano = d.getFullYear();
  return diaSemana + ', ' + dia + ' de ' + mes + ' de ' + ano;
}

/**
 * Exibe mensagem de erro inline.
 * @param {string} msg - Texto do erro.
 * @param {string} elementId - ID do elemento de erro.
 */
function exibirMensagemErro(msg, elementId) {
  const el = document.getElementById(elementId);
  el.textContent = msg;
  el.classList.add('error-message--visible');

  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => {
    el.classList.remove('error-message--visible');
  }, 3000);
}

/**
 * Limpa mensagem de erro.
 * @param {string} elementId - ID do elemento de erro.
 */
function limparMensagemErro(elementId) {
  const el = document.getElementById(elementId);
  el.textContent = '';
  el.classList.remove('error-message--visible');
}

/**
 * Atualiza um contador de tentativas.
 * @param {string} elementId - ID do span do contador.
 * @param {number} valor - Valor numérico.
 */
function atualizarContador(elementId, valor) {
  document.getElementById(elementId).textContent = valor;
}

// ============================================================
// SEÇÃO 13 — INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Carregar dados
    const items = await carregarDados();
    dadosHardware = items;

    // Exibir streak na home
    exibirStreak();

    // Inicializar modo diário (prepara tudo, mas não mostra a tela)
    inicializarDiario(items);

    // Inicializar modo prática (prepara listeners, mas não mostra)
    inicializarPratica(items);
    configurarListenersPratica(items);

    // Configurar navegação entre telas
    document.getElementById('card-hardware').addEventListener('click', () => {
      exibirStreak();
      irParaDiario();
    });
    document.getElementById('card-hardware').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { exibirStreak(); irParaDiario(); }
    });

    document.getElementById('card-pratica').addEventListener('click', () => {
      // Se prática já acabou de uma rodada, reiniciar
      if (pratica.concluida) {
        novaRodadaPratica(items);
      }
      irParaPratica();
    });
    document.getElementById('card-pratica').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (pratica.concluida) novaRodadaPratica(items);
        irParaPratica();
      }
    });

    document.getElementById('btn-voltar-diario').addEventListener('click', irParaHome);
    document.getElementById('btn-voltar-pratica').addEventListener('click', irParaHome);

    // Compartilhar (modo diário)
    document.getElementById('diario-btn-compartilhar').addEventListener('click', () => {
      const streak = carregarStreak();
      const texto = gerarTextoCompartilhar(
        diario.tentativas,
        diario.resultados,
        streak,
        diario.resultado
      );
      copiarParaClipboard(texto, 'diario-feedback-copiado');
    });

    // Mostrar tela inicial
    mostrarTela('tela-home');

  } catch (erro) {
    const body = document.body;
    const msgErro = document.createElement('div');
    msgErro.classList.add('error-message', 'error-message--visible');
    msgErro.textContent = 'Erro ao carregar o jogo. Verifique se está usando um servidor local (ex.: Live Server).';
    msgErro.style.display = 'block';
    msgErro.style.margin = '2rem';
    body.prepend(msgErro);
  }
});
