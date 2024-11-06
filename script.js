let palavras = [];

fetch('palavras.txt')
    .then(response => response.text())
    .then(data => {
        palavras = data.split('\n').map(palavra => palavra.trim());
        palavras = palavras.filter(palavra => palavra.length === 5);
        palavras = palavras.map(palavra => palavra.toUpperCase());
        iniciarJogo();
    })
    .catch(error => {
        console.error('Erro ao carregar a lista de palavras:', error);
    });

let palavraDoDia;
let tentativasRestantes = 6;
let tentativaAtual = ['', '', '', '', ''];
let posicaoAtual = 0; // Posição do cursor
let linhaAtual = 0; // Índice da linha atual

function iniciarJogo() {
    palavraDoDia = palavras[Math.floor(Math.random() * palavras.length)];
    initBoard();
    initHiddenInput();
}

function initBoard() {
    const board = document.getElementById("game-board");
    board.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        let row = document.createElement("div");
        row.className = "row";

        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "tile";
            box.setAttribute('data-row', i);
            box.setAttribute('data-col', j);
            box.addEventListener('click', () => selecionarCaixa(i, j));
            row.appendChild(box);
        }

        board.appendChild(row);
    }

    // Selecionar a primeira caixa
    selecionarCaixa(linhaAtual, posicaoAtual);
}

function initHiddenInput() {
    const hiddenInput = document.getElementById('hidden-input');

    // Quando a página é tocada, focar no input oculto para abrir o teclado
    document.addEventListener('touchstart', () => {
        hiddenInput.focus();
    });

    // Quando a página é clicada (para desktops)
    document.addEventListener('mousedown', () => {
        hiddenInput.focus();
    });

    // Capturar eventos de teclado do input oculto
    hiddenInput.addEventListener('keydown', (e) => {
        if (tentativasRestantes === 0) {
            return;
        }

        let pressedKey = String(e.key).toUpperCase();

        if (pressedKey === "BACKSPACE") {
            e.preventDefault();
            deletarLetra();
            return;
        }

        if (pressedKey === "ENTER") {
            e.preventDefault();
            checarTentativa();
            return;
        }

        if (/^[A-ZÇ]$/.test(pressedKey)) {
            e.preventDefault();
            inserirLetra(pressedKey);
        }
    });
}

function inserirLetra(letra) {
    if (posicaoAtual >= 5) {
        return;
    }

    let row = document.getElementsByClassName("row")[linhaAtual];
    let box = row.children[posicaoAtual];
    box.textContent = letra;
    tentativaAtual[posicaoAtual] = letra;
    moverCursor(1);
}

function deletarLetra() {
    if (posicaoAtual <= 0) {
        return;
    }

    moverCursor(-1);
    let row = document.getElementsByClassName("row")[linhaAtual];
    let box = row.children[posicaoAtual];
    box.textContent = "";
    tentativaAtual[posicaoAtual] = '';
}

function selecionarCaixa(linha, coluna) {
    if (linha !== linhaAtual) return; // Só permite selecionar na linha atual

    // Remove a seleção anterior
    let tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.classList.remove('selected'));

    // Seleciona a nova caixa
    let box = document.querySelector(`.row:nth-child(${linha + 1}) .tile:nth-child(${coluna + 1})`);
    box.classList.add('selected');
    posicaoAtual = coluna;

    // Focar no input oculto para garantir que o teclado esteja ativo
    document.getElementById('hidden-input').focus();
}

function moverCursor(direcao) {
    // Remove a seleção atual
    let row = document.getElementsByClassName("row")[linhaAtual];
    let box = row.children[posicaoAtual];
    box.classList.remove('selected');

    posicaoAtual += direcao;

    // Limita o cursor aos limites da linha
    if (posicaoAtual < 0) posicaoAtual = 0;
    if (posicaoAtual > 5) posicaoAtual = 5;

    // Seleciona a nova caixa
    if (posicaoAtual < 5) {
        box = row.children[posicaoAtual];
        box.classList.add('selected');
    }

    // Focar no input oculto para garantir que o teclado esteja ativo
    document.getElementById('hidden-input').focus();
}

function normalizarPalavra(palavra) {
    return palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function checarTentativa() {
    let tentativaString = tentativaAtual.join("");

    if (tentativaString.length != 5 || tentativaAtual.includes('')) {
        alert("A palavra deve ter 5 letras.");
        return;
    }

    let tentativaNormalizada = normalizarPalavra(tentativaString);
    let palavraDoDiaNormalizada = normalizarPalavra(palavraDoDia);

    if (!palavras.map(normalizarPalavra).includes(tentativaNormalizada)) {
        alert("Palavra não reconhecida.");
        return;
    }

    let palavraArray = Array.from(palavraDoDia);
    let palavraNormalizadaArray = Array.from(palavraDoDiaNormalizada);
    let tentativaArray = Array.from(tentativaString);
    let tentativaNormalizadaArray = Array.from(tentativaNormalizada);

    let resultado = ['', '', '', '', '']; // 'correct', 'present', 'absent'
    let palavraUsada = [false, false, false, false, false];

    // Primeira passagem: letras corretas na posição correta
    for (let i = 0; i < 5; i++) {
        if (tentativaNormalizadaArray[i] === palavraNormalizadaArray[i]) {
            resultado[i] = 'correct';
            palavraUsada[i] = true;
            tentativaArray[i] = palavraArray[i]; // Atualiza com a letra acentuada
        }
    }

    // Segunda passagem: letras corretas na posição errada
    for (let i = 0; i < 5; i++) {
        if (resultado[i] === '') {
            for (let j = 0; j < 5; j++) {
                if (!palavraUsada[j] && tentativaNormalizadaArray[i] === palavraNormalizadaArray[j]) {
                    resultado[i] = 'present';
                    palavraUsada[j] = true;
                    tentativaArray[i] = palavraArray[j]; // Atualiza com a letra acentuada
                    break;
                }
            }
            if (resultado[i] === '') {
                resultado[i] = 'absent';
            }
        }
    }

    // Atualizar o conteúdo dos blocos e aplicar as classes CSS
    let row = document.getElementsByClassName("row")[linhaAtual];
    for (let i = 0; i < 5; i++) {
        let box = row.children[i];
        box.textContent = tentativaArray[i];
        box.classList.remove('selected');
        box.classList.add(resultado[i]);
    }

    // Verificar se o jogador venceu
    if (tentativaNormalizada === palavraDoDiaNormalizada) {
        // Colorir a palavra inteira de verde antes do aviso de vitória
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                let box = row.children[i];
                box.classList.remove('present', 'absent');
                box.classList.add('correct');
            }
        }, 100);

        // Exibir o aviso de vitória após uma pequena pausa
        setTimeout(() => {
            alert("Parabéns! Você acertou!");
        }, 600);

        tentativasRestantes = 0;
        return;
    } else {
        tentativasRestantes -= 1;
        linhaAtual += 1;
        tentativaAtual = ['', '', '', '', ''];
        posicaoAtual = 0;

        if (tentativasRestantes === 0) {
            alert(`Você perdeu! A palavra era ${palavraDoDia}.`);
        } else {
            // Selecionar a primeira caixa da próxima linha
            selecionarCaixa(linhaAtual, posicaoAtual);
        }
    }
}
