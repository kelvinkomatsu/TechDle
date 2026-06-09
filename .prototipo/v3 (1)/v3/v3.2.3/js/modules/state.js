/**
 * modules/state.js
 * Central place for CONFIG and mutable in-memory state.
 * Everything here is imported by other modules instead of
 * creating "globals". This improves reusability across pages.
 */

/** Column schema (from original game.js) */
export const COLUMNS = [
  { key: "ITEM",               label: "Item",       partial: false },
  { key: "TIPO",               label: "Tipo",       partial: true  },
  { key: "CONEXAO",            label: "Conexão",    partial: true  },
  { key: "FUNCAO",             label: "Função",     partial: true  },
  { key: "ENERGIA",            label: "Energia",    partial: true  },
  { key: "TIPO_DE_MEMORIA",    label: "Memória",    partial: true  },
  { key: "INSTALACAO",         label: "Instalação", partial: true  },
  { key: "TIPO_DE_TECNOLOGIA", label: "Tecnologia", partial: true  },
];

export const PARTIALABLE_KEYS = new Set(COLUMNS.filter(c => c.partial).map(c => c.key));

/**
 * Static settings used on any page that consumes the game core.
 * jsonPath can be overridden per page if needed.
 */
export const CONFIG = {
  jsonPath: "src/componentes.json",
  placeholderValue: "",
  maxAttempts: 8,
};

/** Mutable game state (single round). */
export const state = {
  /** @type {Array<Object>} loaded components (rows) */
  data: [],
  /** @type {Set<number>} indices currently available for guessing */
  available: new Set(),
  /** @type {number|null} index of the secret/answer item */
  answerIndex: null,
  /** @type {Array<number>} indices guessed so far (in order) */
  attempts: [],
};
