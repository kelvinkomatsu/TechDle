# TechDle — Pontos de Melhoria
> Análise crítica do projeto desde a ideia de negócio até a execução técnica

---

## 1. Ideia de Negócio e Posicionamento

### 1.1 Diferenciação insuficiente dentro do próprio nicho
**Problema:** O projeto se apresenta como "Wordle de tecnologia", mas os jogos do gênero dle já são dezenas. Sem uma identidade visual e narrativa próprias, o TechDle corre o risco de ser percebido como mais um clone genérico.

**Melhoria:** Definir um nome de marca forte, uma mascote ou identidade visual que remeta ao universo de tecnologia e ao contexto educacional. Ex: um robô-personagem que reage às tentativas do jogador, reforçando o caráter educativo.

---

### 1.2 Falta de proposta de valor clara para diferentes públicos
**Problema:** O documento cita como público-alvo "alunos e entusiastas de tecnologia", mas não segmenta nem prioriza. Estudantes do ensino médio que querem ingressar na área têm necessidades muito diferentes das de alunos de ADS no 3º semestre.

**Melhoria:** Criar personas de usuário bem definidas (ex.: calouro de ADS, profissional de TI se atualizando, jovem curioso sobre tecnologia) e adaptar o nível de dificuldade e o feedback educacional para cada uma.

---

### 1.3 Ausência de estratégia de distribuição e crescimento
**Problema:** O plano de hospedagem (Hostgator + GoDaddy) existe, mas não há nenhuma estratégia de como o jogo chegará até os usuários. Um jogo sem jogadores não gera dados para avaliação.

**Melhoria:** Definir um plano mínimo de divulgação: grupos de WhatsApp/Discord de faculdades, postagens em fóruns como Reddit (r/brdev), perfis no Instagram/TikTok mostrando o jogo, integração com professores que usarão em sala.

---

### 1.4 Modelo de continuidade não detalhado
**Problema:** O projeto menciona "atualizações periódicas", mas não define quem as fará após a conclusão do TCC/extensão, com qual frequência, ou como novos itens serão validados.

**Melhoria:** Criar um processo de contribuição (ex.: repositório público no GitHub com um guia de contribuição) ou estabelecer um grupo de manutenção com outros alunos interessados. Isso transforma o projeto de trabalho acadêmico em produto sustentável.

---

## 2. Design do Jogo (Game Design)

### 2.1 Número baixo de itens no dataset inicial
**Problema:** O Modo Hardware conta com apenas 22 itens. Em jogos do gênero dle com ciclo diário, isso significa que após 22 dias o jogador já viu todos os itens e perde o incentivo de retornar.

**Melhoria:** Expandir o dataset antes do lançamento público. Meta sugerida: mínimo de 60–100 itens por modo para garantir pelo menos 2–3 meses de conteúdo diário sem repetição. Adicionar itens como SSD SATA, placa de captura, nobreak, hub USB, tablet, entre outros.

---

### 2.2 Falta de limite de tentativas definido
**Problema:** O documento não especifica quantas tentativas o jogador tem por dia. Esse é um elemento central da mecânica dle — jogos como Wordle têm 6 tentativas, Pokedle normalmente 8.

**Melhoria:** Definir e documentar o número de tentativas. Sugestão: 8 tentativas para o Modo Hardware, dado que o espaço de itens é maior e o feedback por características múltiplas já é mais rico que o Wordle de letras.

---

### 2.3 Sem progressão ou recompensa por sequência de dias
**Problema:** Não há sistema de streak (sequência de dias jogados) nem nenhuma recompensa por consistência. Esses elementos são fundamentais para a retenção em jogos diários.

**Melhoria:** Implementar contador de dias consecutivos (streak), badges ou conquistas simples (ex.: "7 dias seguidos", "Acertou na 1ª tentativa"). Não precisa ser complexo — um contador visual já aumenta significativamente o engajamento.

---

### 2.4 Compartilhamento social ausente
**Problema:** Uma das principais alavancas de crescimento orgânico do Wordle foi o compartilhamento do resultado em formato de emojis coloridos no Twitter/X. O TechDle não menciona esse recurso.

**Melhoria:** Implementar botão "Compartilhar resultado" que gera um texto com emojis representando as tentativas (verde/amarelo/vermelho), sem revelar o item do dia. Isso é barato de implementar e tem alto potencial de viralização.

---

### 2.5 Ausência de modo prática/treino
**Problema:** O modelo diário limita o aprendizado a 1 tentativa por dia. Para um jogo com propósito educacional, isso é uma restrição severa — o estudante não pode treinar o conteúdo de forma repetida.

**Melhoria:** Adicionar um Modo Prática (ou Modo Livre) onde o jogador pode tentar adivinhar itens aleatórios sem limite diário, com fins puramente de estudo. O modo diário mantém o engajamento competitivo; o modo prática atende ao objetivo educacional.

---

## 3. Arquitetura e Decisões Técnicas

### 3.1 Inconsistência entre stack planejada e implementada
**Problema:** O documento inicial cita PHP e MySQL para o back-end, mas a implementação da Extensão 2025-2 usou apenas JavaScript (sem back-end server-side). Essa inconsistência pode gerar confusão para quem lê a documentação ou der continuidade ao projeto.

**Melhoria:** Consolidar a decisão técnica explicitamente: o projeto é 100% front-end (HTML/CSS/JS + JSON estático) ou tem um back-end server-side? Se a escolha foi simplificar para JavaScript puro, documentar isso como decisão arquitetural consciente, com os trade-offs explicados.

---

### 3.2 JSON estático limita escalabilidade
**Problema:** Usar um arquivo JSON estático para os dados funciona para 22 itens, mas não escala bem para múltiplos modos, centenas de itens, itens do dia controlados pelo servidor, ou estatísticas de usuários.

**Melhoria:** Planejar a migração para uma API simples (mesmo que Node.js + Express + SQLite) à medida que o projeto cresce. No mínimo, separar a lógica do "item do dia" para o servidor, evitando que o usuário possa ver antecipadamente qual é o item do dia inspecionando o JSON no navegador.

---

### 3.3 Item do dia previsível no front-end puro
**Problema:** Se o sorteio do item do dia acontece no JavaScript do navegador com base em data, qualquer usuário pode abrir o DevTools, inspecionar o código ou o JSON e descobrir o item antes de jogar.

**Melhoria:** Implementar um endpoint de back-end que retorna apenas o item do dia sem expor o dataset completo. Mesmo uma solução simples com Vercel Functions ou Netlify Functions resolve isso sem infraestrutura custosa.

---

### 3.4 Lógica de comparação com campo "X" não especificada
**Problema:** Vários campos do dataset usam `X` para indicar "não se aplica" (ex.: Gabinete não tem TIPO DE MEMÓRIA). O algoritmo de comparação precisa tratar esse valor explicitamente para não marcar como errado quando ambos os itens têm `X`.

**Melhoria:** Definir uma regra clara: quando ambos os itens têm `X` na mesma característica → Verde (ambos não se aplicam, logo são iguais). Quando apenas um tem `X` → Vermelho. Documentar isso como regra de negócio do algoritmo.

---

### 3.5 Ausência de tratamento de normalização textual
**Problema:** O campo de busca/chute do usuário é sensível a variações como "placa de video" vs "Placa de Vídeo" (maiúsculas, acentos, espaços). Sem normalização, o sistema rejeitará entradas válidas.

**Melhoria:** Implementar normalização no input: converter para minúsculas, remover acentos, trim de espaços. Adicionalmente, implementar um sistema de autocomplete/sugestão ao digitar, que é padrão nos jogos dle e melhora muito a UX.

---

## 4. UX e Interface

### 4.1 Sem wireframes ou protótipos documentados
**Problema:** O documento menciona Adobe XD para prototipagem, mas nenhum wireframe ou protótipo é apresentado. Para um agente de IA ou novo desenvolvedor retomar o projeto, não há referência visual de como a interface deve ser.

**Melhoria:** Incluir na documentação ao menos um wireframe básico da tela principal (grid de tentativas, campo de input, cabeçalho de categorias). Mesmo um sketch ASCII ou uma descrição detalhada da estrutura visual já ajuda.

---

### 4.2 Responsividade não detalhada
**Problema:** Bootstrap é citado para responsividade, mas não há especificação de como o grid de 8 colunas de características se comporta em telas mobile pequenas (360px de largura). Um grid de 8 colunas em mobile colapsa sem tratamento correto.

**Melhoria:** Definir explicitamente o layout mobile: scroll horizontal no grid de tentativas, ou colapso das colunas em visualização empilhada. Testar em dispositivos reais ou emuladores antes do lançamento.

---

### 4.3 Acessibilidade não mencionada
**Problema:** O projeto tem objetivo de "inclusão educacional e ensino democrático", mas não menciona nenhuma consideração de acessibilidade (contraste de cores, suporte a leitores de tela, navegação por teclado).

**Melhoria:** Adicionar ao escopo mínimo de acessibilidade: contraste suficiente nas cores de feedback (verde/amarelo/vermelho acessíveis para daltônicos), textos alternativos, e que o jogo seja completamente jogável via teclado.

---

## 5. Gestão do Projeto

### 5.1 Projeto individual sem plano de contingência
**Problema:** O projeto é desenvolvido individualmente. Se o aluno tiver problemas pessoais, acadêmicos ou técnicos, não há redundância ou plano B documentado.

**Melhoria:** Documentar explicitamente pontos de checkpoint com os orientadores. Manter o repositório GitHub sempre atualizado serve como contingência natural — qualquer pessoa pode retomar o projeto a partir do histórico de commits.

---

### 5.2 Cronograma sem marcos intermediários dentro de cada semestre
**Problema:** O cronograma é dividido apenas por semestre (4 entregas em 2 anos). Não há marcos semanais ou mensais dentro de cada semestre, o que dificulta identificar atrasos cedo.

**Melhoria:** Para cada semestre, criar um mini-roadmap com entregáveis mensais. Ex.: "Mês 1 do 2026-1: JSON de itens finalizado e validado. Mês 2: algoritmo de comparação v2.0 implementado."

---

### 5.3 Critérios de teste de usabilidade vagos
**Problema:** O plano menciona "grupo diversificado de usuários" e "feedbacks detalhados", mas não define: quantos usuários, quais perfis, quais tarefas serão pedidas, quais métricas serão coletadas, nem como os resultados influenciarão as melhorias.

**Melhoria:** Estruturar os testes de usabilidade com um protocolo mínimo: 5–8 participantes por perfil (calouro de ADS, pessoa sem contexto de TI), lista de tarefas definidas, formulário padronizado, e critérios de aprovação (ex.: taxa de conclusão > 80%).

---

## 6. Conteúdo Educacional

### 6.1 Feedback educacional não especificado
**Problema:** O documento menciona que o jogo oferecerá "feedback educacional automático", mas não detalha o que isso significa na prática. Apenas as cores de comparação, ou haverá texto explicativo sobre o item após o fim de cada rodada?

**Melhoria:** Definir que ao fim de cada rodada (acerto ou esgotamento de tentativas) o jogo exibe uma "ficha técnica" do item do dia com uma descrição educacional de 2–3 linhas. Isso transforma cada sessão de jogo em um momento de aprendizado garantido, independente de o jogador ter acertado ou não.

---

### 6.2 Ausência de curadoria pedagógica dos itens
**Problema:** Os itens do dataset foram definidos pelos alunos, mas não há evidência de validação por docente da área de hardware ou alinhamento com a ementa do curso de ADS.

**Melhoria:** Incluir na metodologia uma etapa formal de revisão pedagógica dos itens e suas características por um docente da disciplina de Arquitetura de Computadores ou equivalente, garantindo a precisão técnica do conteúdo educacional.

---

### 6.3 Campo "TIPOS DE TECNOLOGIA" é subjetivo e inconsistente
**Problema:** O campo "Tipos de Tecnologia" mistura categorias heterogêneas: algumas são características técnicas (PWM, GPU), outras são padrões de mercado (Full HD, 4K), outras são adjetivos (Compacto, Alta Velocidade). Isso torna a comparação desse campo ambígua para o algoritmo e confusa para o jogador.

**Melhoria:** Dividir esse campo em subcategorias mais precisas, ou redefinir o critério de preenchimento com uma regra clara. Alternativa: renomear para "Diferenciais Notáveis" e documentar que é um campo de múltiplos valores onde a parcialidade (amarelo) se aplica sempre que houver interseção.

---

## 7. Resumo Priorizado

| Prioridade | Área | Ação |
|---|---|---|
| 🔴 Alta | Técnica | Proteger o item do dia no servidor (evitar spoiler via DevTools) |
| 🔴 Alta | Game Design | Expandir dataset para 60+ itens antes do lançamento público |
| 🔴 Alta | Game Design | Definir e implementar limite de tentativas |
| 🔴 Alta | Técnica | Implementar autocomplete/normalização no campo de input |
| 🔴 Alta | Técnica | Definir tratamento do valor `X` no algoritmo de comparação |
| 🟡 Média | Game Design | Adicionar sistema de streak e compartilhamento de resultado |
| 🟡 Média | Game Design | Implementar Modo Prática/Treino |
| 🟡 Média | Conteúdo | Adicionar ficha técnica educacional ao fim de cada rodada |
| 🟡 Média | UX | Definir layout mobile para o grid de 8 colunas |
| 🟡 Média | Projeto | Criar protocolo formal de testes de usabilidade |
| 🟢 Baixa | Negócio | Definir estratégia de divulgação e canais de distribuição |
| 🟢 Baixa | Conteúdo | Revisão pedagógica dos itens e características por docente |
| 🟢 Baixa | Projeto | Criar marcos mensais dentro de cada semestre |
| 🟢 Baixa | Negócio | Definir modelo de continuidade pós-entrega acadêmica |
