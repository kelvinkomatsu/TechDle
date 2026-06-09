# TechDle — Adivinhe o Componente 🖥️

TechDle é um jogo educativo de adivinhação sobre hardware de computadores e periféricos, inspirado no estilo Wordle. Teste seus conhecimentos em tecnologia e descubra se você consegue adivinhar o componente oculto!

Este é um Projeto de Extensão do curso de Análise e Desenvolvimento de Sistemas (ADS) da **UNISEPE**.

## 🚀 Funcionalidades

- **Modo Hardware (Diário)**: Adivinhe o componente do dia! Você tem tentativas ilimitadas, mas o item misterioso muda a cada 24 horas.
- **Modo Prática**: Treine sem limites. Adivinhe itens aleatórios do nosso banco de dados, reiniciando novas rodadas sempre que quiser.
- **Modos Futuros**: Em breve, o jogo ganhará os modos "Redes" e "Linguagens".
- **Sistema de Streak (Sequências)**: Mantenha sua sequência de dias seguidos jogando no modo diário e alcance seu recorde pessoal.
- **Compartilhamento**: Copie seu resultado no formato clássico de emojis de bloquinhos (🟩 🟨 🟥) e compartilhe seu desempenho com os amigos.

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3**
- **JavaScript (ES6+) Vanilla** para toda a lógica do jogo
- **Bootstrap 5.3.3** para facilitação de UI
- **Local Storage API** para salvar seu progresso, estado do jogo e sequências de vitórias no navegador
- **JSON** para o banco de dados de hardware

## 🎲 Como Jogar

O objetivo do jogo é descobrir o hardware ou periférico do dia com base nas características listadas.
Ao digitar um palpite, o jogo comparará as propriedades do seu item com o misterioso:

- 🟩 **Verde (Correto):** A característica do seu palpite é igual à do componente misterioso.
- 🟨 **Amarelo (Parcial):** O seu palpite compartilha parcialmente as características (ex: um tem PCIe e HDMI, e o outro só tem HDMI).
- 🟥 **Vermelho (Incorreto):** Não há correspondência alguma.

### As características comparadas são:
- **Tipo**: Hardware ou Periférico.
- **Conexão**: Como o item se conecta (ex: USB, HDMI, PCIe, Socket).
- **Função**: Papel principal (ex: Processamento, Armazenamento, Refrigeração).
- **Energia**: De onde recebe energia (ex: Fonte, Placa-mãe, Rede Elétrica).
- **Memória**: Se possui memória embarcada e de que tipo.
- **Instalação**: Se é Interna ou Externa ao gabinete.
- **Tecnologias**: Aspectos variados (ex: RGB, Alta Velocidade, Wireless).

## ⚙️ Como Executar o Projeto Localmente

Como o projeto faz o carregamento assíncrono do arquivo `data/hardware.json` através do `fetch()`, é obrigatório rodá-lo utilizando um **servidor local** (abrir o arquivo via `file://` gerará erros de CORS no navegador).

**1. Usando a extensão Live Server no VS Code (Recomendado):**
- Instale a extensão "Live Server".
- Clique com o botão direito no `index.html` e escolha **Open with Live Server**.

**2. Usando o Node.js (`http-server`):**
Abra o terminal na pasta do projeto e rode:
```bash
npx http-server
```

**3. Usando o Python:**
Abra o terminal na pasta do projeto e rode:
```bash
python -m http.server 8000
```

## 🤝 Desenvolvedor

- **Kelvin** - kelvin.komatsu@gmail.com
