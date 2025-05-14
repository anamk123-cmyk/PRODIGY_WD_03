const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const gameModeEl = document.getElementById("gameMode");
const themeToggle = document.getElementById("themeToggle");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const draws = document.getElementById("draws");

let board = Array(9).fill("");
let currentPlayer = "X";
let isGameOver = false;
let mode = "pvp";

const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Generate board
function createBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    boardEl.appendChild(cell);
  }
}
createBoard();

// Handle click
boardEl.addEventListener("click", (e) => {
  if (isGameOver || !e.target.classList.contains("cell")) return;
  const idx = e.target.dataset.index;
  if (board[idx] !== "") return;

  makeMove(idx, currentPlayer);

  if (mode !== "pvp" && !isGameOver && currentPlayer === "O") {
    setTimeout(() => {
      const aiMoveIdx = mode === "ai-easy" ? getRandomMove() : getBestMove();
      makeMove(aiMoveIdx, "O");
    }, 500);
  }
});

function makeMove(index, player) {
  board[index] = player;
  const cell = document.querySelector(`.cell[data-index='${index}']`);
  cell.textContent = player;
  cell.classList.add(player);

  if (checkWin(player)) {
    showWin(player);
  } else if (board.every(cell => cell !== "")) {
    statusEl.textContent = "It's a draw!";
    draws.textContent = +draws.textContent + 1;
    isGameOver = true;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusEl.textContent = `${currentPlayer}'s Turn`;
  }
}

function checkWin(player) {
  return winCombos.some(combo => combo.every(i => board[i] === player));
}

function showWin(player) {
  const combo = winCombos.find(c => c.every(i => board[i] === player));
  combo.forEach(i => {
    const cell = document.querySelector(`.cell[data-index='${i}']`);
    cell.classList.add("win");
  });
  statusEl.textContent = `${player} wins!`;
  if (player === "X") scoreX.textContent = +scoreX.textContent + 1;
  else scoreO.textContent = +scoreO.textContent + 1;
  isGameOver = true;
}

function resetGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  isGameOver = false;
  statusEl.textContent = `${currentPlayer}'s Turn`;
  createBoard();
}
resetBtn.addEventListener("click", resetGame);

gameModeEl.addEventListener("change", () => {
  mode = gameModeEl.value;
  resetGame();
});

// Random AI
function getRandomMove() {
  const empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

// Minimax AI
function getBestMove() {
  return minimax(board, "O").index;
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((v, i) => v === "" ? i : null).filter(v => v !== null);

  if (checkWinMinimax(newBoard, "X")) return { score: -10 };
  if (checkWinMinimax(newBoard, "O")) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    const result = minimax(newBoard, player === "O" ? "X" : "O");
    move.score = result.score;

    newBoard[availSpots[i]] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === "O") {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function checkWinMinimax(b, p) {
  return winCombos.some(combo => combo.every(i => b[i] === p));
}

// Theme Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});
