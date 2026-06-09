// Elementos em tela: capturam os elementos do DOM necessários para a interatividade
const opcoes = document.getElementById('opcoes');
const tabelaResultados = document.getElementById('tabelaResultados');
const formularioFeedback = document.getElementById('formularioFeedback');
const mensagemFeedback = document.getElementById('mensagemFeedback');
const listaEscolhas = document.getElementById('listaEscolhas');

// Função reutilizável para criar uma linha na tabela com os dados fornecidos e a classe desejada
function criarLinhaTabela(dados, classe) {
  const linha = document.createElement('tr');
  linha.className = classe;
  dados.forEach(item => {
    const coluna = document.createElement('td');
    coluna.innerHTML = item;
    linha.appendChild(coluna);
  });
  return linha;
}

// Carregamento do arquivo JSON com os dados dos componentes e início do jogo
fetch('./src/componentes.json')
  .then(response => {
    // Verifica se a requisição foi bem-sucedida
    if (!response.ok) {
      throw new Error('Erro ao carregar o arquivo JSON');
    }
    return response.json();
  })
  .then(data => {
    const resultados = data;
    const indiceElementoEscolhido = Math.floor(Math.random() * resultados.length);

    resultados.forEach((resultado, index) => {
      const opcao = document.createElement('option');
      opcao.value = index;
      opcao.innerHTML = resultado.ITEM;
      opcoes.appendChild(opcao);
    });

    formularioFeedback.onsubmit = function (e) {
      e.preventDefault();
      const indiceSelecionado = parseInt(opcoes.value);
      const acertou = indiceSelecionado === indiceElementoEscolhido;
      const dados = Object.values(resultados[acertou ? indiceElementoEscolhido : indiceSelecionado]);
      const linha = criarLinhaTabela(dados, acertou ? 'linhaAcerto' : 'linhaErro');

      // Adiciona a nova linha no topo da tabela (antes do primeiro filho)
      if (listaEscolhas.firstChild) {
        listaEscolhas.insertBefore(linha, listaEscolhas.firstChild);
      } else {
        listaEscolhas.appendChild(linha);
      }

      tabelaResultados.style.display = "block";
      mensagemFeedback.innerHTML = acertou ? "Você acertou!!" : "Você errou, tente novamente";

      if (acertou) {
        formularioFeedback.style.display = "none";
      } else {
        // Remove a opção incorreta do seletor
        const opcaoErrada = opcoes.querySelector(`option[value="${indiceSelecionado}"]`);
        if (opcaoErrada) {
          opcaoErrada.remove();
        }
      }
    }
  })
  .catch(error => {
    // Em caso de erro no carregamento do JSON, exibe no console
    console.error('Erro:', error);
  });
