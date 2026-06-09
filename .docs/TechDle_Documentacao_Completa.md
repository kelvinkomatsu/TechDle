# TechDle — Documentação Completa do Projeto
> Documentação técnica e conceitual para uso por agentes de inteligência artificial

---

## 1. Visão Geral

**Nome do projeto:** TechDle — Gamificação para Estudos em Tecnologia  
**Instituição:** UNIVR – Centro Universitário do Vale do Ribeira / UNISEPE EAD  
**Curso:** Análise e Desenvolvimento de Sistemas (ADS)  
**Modalidade:** Projeto de Extensão  
**Carga horária:** 30 horas  
**Período de execução:** Agosto de 2024 – Dezembro de 2026  

### Equipe
| Papel | Nome | RA | E-mail |
|---|---|---|---|
| Coordenador | Prof. Marcio dos Reis Guimarães | — | — |
| Docente | Esp. Vanessa Felix Macedo Randis Veiga | — | — |
| Docente | M.Sc. Victor de Andrade Machado | — | — |
| Aluno Proponente | Kelvin Komatsu de Andrade | 0395304 | kelvinkomatsu@outlook.com |
| Aluno Proponente | Eduardo Matheus Barbosa de Toledo Cataldo | 0398264 | eduardomatheusbtc@hotmail.com |

**Público-alvo:** Alunos e entusiastas da área de tecnologia e desenvolvimento.

---

## 2. Conceito do Jogo

### 2.1 Descrição
TechDle é um jogo educativo de adivinhação diária inspirado na mecânica do **Wordle** e suas variantes temáticas (Narutodle, OnePiecedle, Pokedle, LoLdle). O diferencial é o foco em conteúdos técnicos do curso de ADS — hardware, periféricos, redes de computadores, linguagens de programação e algoritmos.

O jogador tenta adivinhar um **item de tecnologia do dia** realizando chutes de componentes/itens. A cada tentativa, o sistema retorna feedback visual por cores indicando o quão próximo cada característica do item chutado está do item correto.

### 2.2 Referências de Jogabilidade
Os jogos do gênero "dle" que inspiram o TechDle:

| Jogo | Domínio | Mecânica |
|---|---|---|
| Wordle | Palavras | Adivinhar palavra de 5 letras com feedback por letra |
| Narutodle | Anime Naruto | Adivinhar personagem por características visuais/de lore |
| OnePiecedle | Anime One Piece | Idem, personagens de One Piece |
| Pokedle | Pokémon | Adivinhar Pokémon por tipo, geração, cor, etc. |
| LoLdle | League of Legends | Adivinhar campeão por atributos |

O TechDle adapta essa mecânica para o universo de hardware e tecnologia.

### 2.3 Modos de Jogo Planejados
- **Modo Hardware** (primeiro a ser desenvolvido): o jogador adivinha componentes e periféricos de computador.
- **Modos futuros:** Redes de Computadores, Linguagens de Programação, Algoritmos.

---

## 3. Mecânica Central do Jogo

### 3.1 Fluxo de uma Rodada
1. Um item de tecnologia é sorteado/selecionado como **item do dia**.
2. O jogador digita o nome de um item que conhece e tenta adivinhar.
3. O sistema compara cada **característica** do item chutado com o item do dia.
4. O jogador recebe feedback visual por célula/coluna.
5. O processo se repete até o jogador acertar ou esgotar as tentativas.

### 3.2 Sistema de Feedback por Cores

| Cor | Significado | Critério |
|---|---|---|
| 🟩 Verde | Totalmente correto | A característica do item chutado é idêntica à do item do dia |
| 🟨 Amarelo | Parcialmente correto | O item possui a característica, mas não é a principal ou faz parte de um conjunto maior no item do dia |
| 🟥 Vermelho | Incorreto | A característica não corresponde ao item do dia |

### 3.3 Categorias de Comparação (Modo Hardware)
Cada item é descrito por 8 categorias que são comparadas a cada tentativa:

| Categoria | Descrição | Exemplos de Valores |
|---|---|---|
| **ITEM** | Nome do componente a ser descoberto | Placa-mãe, Processador, Monitor... |
| **TIPO** | Indica se é Hardware, Periférico ou ambos | Hardware / Hardware, Periférico |
| **CONEXÃO** | Conectores usados para ligar ao computador | USB, SATA, HDMI, PCIe, M.2, Socket |
| **FUNÇÃO** | Papel principal no sistema | Processamento, Armazenamento, Entrada, Áudio, Vídeo |
| **ENERGIA** | Fonte de energia do item | Fonte, Placa-mãe, Rede Elétrica, Bateria |
| **TIPO DE MEMÓRIA** | Tipo de memória usada ou integrada | DRAM, VRAM, Flash, Cache, Magnética, BIOS |
| **INSTALAÇÃO** | Forma de instalação | Interna, Externa, Interna e Externa |
| **TIPOS DE TECNOLOGIA** | Tecnologias extras não obrigatórias | RGB, Wi-Fi, Bluetooth, GPU, PWM, Mecânico |

---

## 4. Dataset — Modo Hardware

Dataset completo com todos os itens do Modo Hardware e suas características:

| ITEM | TIPO | CONEXÃO | FUNÇÃO | ENERGIA | TIPO DE MEMÓRIA | INSTALAÇÃO | TIPOS DE TECNOLOGIA |
|---|---|---|---|---|---|---|---|
| Placa-mãe | Hardware | Multiconexão (base de conexão) | Processamento, Comunicação | Fonte | BIOS | Interna | RGB, Chipset |
| Processador | Hardware | Socket | Processamento | Fonte | Cache | Interna | Turbo Boost, Threads |
| Memória RAM | Hardware | DIMM | Processamento | Placa-mãe | DRAM | Interna | Alta Velocidade |
| Placa de Vídeo | Hardware | PCIe, HDMI, DP | Processamento, Vídeo | Fonte | VRAM | Interna | GPU, Ray Tracing, RGB |
| SSD NVMe | Hardware | M.2 | Armazenamento | Placa-mãe | Flash | Interna | Alta Velocidade |
| HD | Hardware | SATA | Armazenamento | Fonte | Magnética | Interna | Alta Capacidade |
| Fonte de Energia | Hardware | ATX 24p, EPS 8p, PCIe 6/8p, SATA, Molex | Energia | Rede Elétrica | X | Interna | PFC Ativo, Modular, Semi-modular |
| Gabinete | Hardware | USB, P2, P3 | Estrutura | X | X | X | RGB, USB Painel Frontal |
| Cooler | Hardware | 3 pinos 5V, 4 pinos 12V | Refrigeração | Fonte, Placa-mãe | X | Interna | RGB, PWM |
| Switch de Rede | Hardware | RJ-45 | Distribuição de rede | Rede Elétrica | X | Interna | Gerenciável, VLAN |
| Roteador | Hardware | RJ-45, Wireless | Distribuição de rede | Rede Elétrica | X | Interna, Externa | Wi-Fi, Dual Band, Firewall |
| Pendrive | Hardware, Periférico | USB | Armazenamento | Placa-mãe | Flash | Externa | Compacto |
| Monitor | Hardware, Periférico | HDMI, DVI, DP, VGA | Vídeo, Áudio | Rede Elétrica | X | Externa | Full HD, 4K, LCD, Q/OLED |
| Teclado | Hardware, Periférico | USB, Wireless | Entrada | Placa-mãe, Bateria | X | Externa | Membrana, Mecânico, RGB |
| Mouse | Hardware, Periférico | USB, Wireless | Entrada | Placa-mãe, Bateria | X | Externa | Óptico, RGB, Laser |
| Fone | Hardware, Periférico | P2, P3, Bluetooth | Áudio | Placa-mãe, Bateria | X | Externa | Sem Fio, Estéreo, Bluetooth |
| Headset | Hardware, Periférico | USB, P2, P3, Bluetooth | Áudio, Comunicação | Placa-mãe, Bateria | X | Externa | Surround, RGB, Bluetooth |
| Microfone | Hardware, Periférico | USB, P2 | Comunicação | Placa-mãe, Bateria | X | Externa | Condensador, Sem Fio |
| Caixa de Som | Hardware, Periférico | P2, USB | Áudio | Placa-mãe, Bateria | X | Externa | Estéreo, Amplificada |
| Webcam | Hardware, Periférico | USB | Vídeo, Comunicação | Placa-mãe | X | Externa | Full HD, 4K, 60FPS |
| Impressora | Hardware, Periférico | USB, Wi-Fi | Impressão, Saída | Rede Elétrica | X | Externa | Jato de Tinta, Scanner, Toner |
| Scanner | Hardware, Periférico | USB | Entrada | Rede Elétrica | X | Externa | Óptico, Alta Resolução |

> **Legenda:** `X` indica que o campo não se aplica ao item ou não possui valor definido.

---

## 5. Stack Tecnológica

### 5.1 Decisões Atuais (Extensão 2025-1 e 2025-2)

**Front-end:**
- HTML — estrutura e organização das páginas
- CSS — aparência visual e responsividade
- JavaScript — exibição de resultados e interações do usuário

**Back-end:**
- JavaScript (Node.js ou browser-side) — lógica central do jogo, processamento de tentativas, comparação de itens

**Dados:**
- JSON — fonte de dados dos itens e características (flexível e nativo ao JavaScript)
- MySQL — banco de dados relacional planejado para versões futuras se necessário

**Frameworks e Bibliotecas:**
- Bootstrap — interfaces responsivas e dinâmicas

**Design:**
- Adobe XD — prototipagem, wireframes e design de interface

**DevOps / Infraestrutura:**
- GitHub — controle de versão e versionamento do código
- Hostgator — hospedagem do jogo
- GoDaddy — aquisição de domínio

**Analytics e Avaliação:**
- Google Analytics — monitoramento de comportamento dos jogadores (tempo de jogo, cliques, itens adivinhados)
- Google PageSpeed Insights — análise de performance
- Google Forms — coleta de feedback e questionários pós-teste
- Discord — canal de comunicação com testadores durante a fase de testes

### 5.2 Estrutura de Arquivos Prevista
```
techdle/
├── index.html          # Página principal do jogo
├── style.css           # Estilos globais
├── script.js           # Lógica do jogo (front-end + back-end JS)
├── data/
│   └── hardware.json   # Dataset do Modo Hardware
└── assets/
    └── ...             # Imagens e recursos visuais
```

### 5.3 Estrutura do JSON de Dados
```json
[
  {
    "item": "Processador",
    "tipo": "Hardware",
    "conexao": ["Socket"],
    "funcao": ["Processamento"],
    "energia": "Fonte",
    "tipoMemoria": "Cache",
    "instalacao": "Interna",
    "tecnologias": ["Turbo Boost", "Threads"]
  }
]
```

---

## 6. Lógica de Comparação

### 6.1 Versão 1.0 (Implementada na Extensão 2025-2)
- Interface HTML/CSS/JS construída.
- Lógica central do jogo em JavaScript funcionando.
- JSON com categorias e características de cada item criado.
- **Limitação conhecida:** o sistema marca todas as características como incorretas quando o item chutado não é o item do dia, sem avaliação individual de cada característica.

### 6.2 Versão 2.0 (Planejada)
Melhorias identificadas para implementação:

**Parcialidade nas características:**  
Cada característica será avaliada individualmente, retornando seu status correto mesmo quando o item completo não corresponde ao item do dia.

**Algoritmo de comparação detalhado:**
```
Para cada característica C do item chutado:
  SE C == característica do item do dia:
    → VERDE (totalmente correto)
  SE C ∈ conjunto de características do item do dia (parcial):
    → AMARELO (parcialmente correto)
  SENÃO:
    → VERMELHO (incorreto)
```

**Exemplo de parcialidade:**  
- Item do dia: Headset (Áudio, Comunicação)  
- Item chutado: Fone (Áudio)  
- Resultado para a categoria FUNÇÃO: 🟨 Amarelo — Fone tem "Áudio" que está no conjunto de funções do Headset, mas não é o conjunto completo.

---

## 7. Roadmap e Cronograma

| Semestre | Atividade | Status |
|---|---|---|
| 2025-1 | Definição do escopo, escolha de tecnologias, planejamento de mecânicas | ✅ Concluído |
| 2025-2 | Implementação do protótipo v1.0 (HTML/CSS/JS + JSON) | ✅ Concluído |
| 2026-1 | Finalização do protótipo v2.0, planejamento dos testes de usabilidade | 🔄 Em andamento |
| 2026-2 | Testes de usabilidade, ajustes, melhorias e entrega final | ⏳ Planejado |

### 7.1 Detalhamento das Metas por Semestre

**2025-1 — Desenvolvimento da mecânica do jogo:**
- Definir escopo, funcionalidades e público-alvo
- Selecionar stack tecnológica (JavaScript, PHP, MySQL)
- Planejar mecânicas inspiradas no Wordle e variantes

**2025-2 — Aprendizado das ferramentas e início do desenvolvimento:**
- Estudar tecnologias selecionadas
- Desenvolver back-end com regras do jogo
- Desenvolver front-end inicial com interface amigável

**2026-1 — Finalização do protótipo e planejamento dos testes:**
- Integrar todas as funcionalidades planejadas
- Planejar cenários e critérios de testes de usabilidade
- Preparar materiais explicativos para usuários testadores

**2026-2 — Testes, ajustes e entrega final:**
- Realizar testes com grupo diversificado de usuários
- Implementar ajustes com base nos feedbacks
- Entregar versão final funcional, usável e alinhada aos objetivos de ensino

---

## 8. Avaliação e Métricas

### 8.1 Avaliação Contínua
- Revisão de código e funcionalidades via GitHub
- Testes de usabilidade ao término de cada funcionalidade
- Monitoramento via Google Analytics

### 8.2 Avaliação Final
- Questionário de impacto no aprendizado (Google Forms) — perguntas objetivas sobre hardware, redes, algoritmos
- Feedback qualitativo sobre experiência, dificuldade e clareza dos conceitos
- Métricas quantitativas: número de jogadores, tempo médio de jogo, tentativas até acerto, taxa de conclusão

### 8.3 Indicadores de Sucesso

**Quantitativos:**
- Número de jogadores que completaram o jogo
- Taxa de engajamento (tempo médio jogado)
- Taxa de sucesso nas tentativas (precisão nas respostas)
- Crescimento no número de usuários durante os testes

**Qualitativos:**
- Feedback positivo sobre a experiência de aprendizado
- Aumento na compreensão dos conceitos (baseado em questionários pós-jogo)
- Satisfação geral com interface e jogabilidade

---

## 9. Objetivos Educacionais

### 9.1 Objetivo Geral
Desenvolver um jogo de gamificação interativo que facilite o aprendizado dos principais conteúdos do curso de ADS, utilizando abordagem lúdica para promover engajamento e despertar interesse por tecnologia de forma acessível.

### 9.2 Objetivos Específicos
1. Criar um jogo com mecânicas de adivinhação para ensinar hardware, redes, linguagens de programação e algoritmos
2. Oferecer feedback educacional automático durante as interações, destacando características relevantes dos itens
3. Promover uma experiência de aprendizado acessível e divertida para estudantes e potenciais ingressantes na área
4. Estimular o interesse por tecnologia por meio da interação lúdica com conteúdos técnicos
5. Testar e avaliar a eficácia da gamificação como metodologia para facilitar o aprendizado em tecnologia

---

## 10. Impactos Esperados

### 10.1 Para o Desenvolvedor (Formação Profissional)
- Desenvolvimento de software fullstack (JavaScript, PHP, HTML, CSS, MySQL)
- UI/UX: prototipagem, design de interfaces e experiência do usuário
- Gerenciamento de projetos: cronogramas, metas, prazos
- Teste e avaliação de produtos: usabilidade, coleta de feedback, iteração

### 10.2 Para o Desenvolvedor (Formação Pessoal)
- Autonomia e gestão do tempo em projeto individual
- Resolução de problemas (bugs, limitações de ferramentas, UX)
- Criatividade e inovação para transformar conteúdo técnico em jogo

### 10.3 Para a Comunidade Acadêmica
- Ferramenta de aprendizado interativa para outros alunos de ADS
- Referência para futuros trabalhos acadêmicos com gamificação
- Potencial para expansão a outros cursos de tecnologia
- Popularização do aprendizado técnico para o público geral

---

## 11. Expansão Futura Planejada

| Modo | Conteúdo | Status |
|---|---|---|
| Hardware | Componentes e periféricos de computador | ✅ Em desenvolvimento |
| Redes | Protocolos, topologias, dispositivos de rede | ⏳ Planejado |
| Linguagens de Programação | Paradigmas, sintaxe, uso, ano de criação | ⏳ Planejado |
| Algoritmos | Complexidade, tipo, estrutura de dados | ⏳ Planejado |

---

## 12. Referências Bibliográficas

- FLANAGAN, David. *JavaScript: o guia definitivo*. 6ª ed. Porto Alegre: Bookman, 2013.
- ABNT NBR 14724. *Trabalhos Acadêmicos — Apresentação*. Rio de Janeiro: ABNT, 2002.
- Portal do Wordle. Disponível em: https://www.nytimes.com/games/wordle
- GORAYEB, F. H. Z.; GORAYEB, S. H. F. P. Z. **Gamificação como ferramenta de ensino: impactos na dinâmica da aprendizagem e no ambiente escolar**. *Revista FT*, ago. 2024.
- MAGALHÃES, M. C. *Adobe XD para UX Designers*. Alura, mai. 2019.
- VERSIANI, Rafael. *GitHub: o que é e qual sua importância?* 2022.
