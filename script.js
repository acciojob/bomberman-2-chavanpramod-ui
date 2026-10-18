const GRID_SIZE = 10;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const TOTAL_BOMBS = 10;

let board = [];
let revealedCount = 0;
let flagCount = 0;
let isGameOver = false;

document.addEventListener("DOMContentLoaded", () => {
    initGame();
});

function initGame() {
    const gridContainer = document.querySelector(".grid-container");
    if (gridContainer) {
        gridContainer.innerHTML = "";
    }
    
    board = Array(TOTAL_CELLS).fill(0).map(() => ({
        isBomb: false,
        isRevealed: false,
        isFlagged: false,
        neighborBombs: 0
    }));

    let bombsPlaced = 0;
    while (bombsPlaced < TOTAL_BOMBS) {
        let index = Math.floor(Math.random() * TOTAL_CELLS);
        if (!board[index].isBomb) {
            board[index].isBomb = true;
            bombsPlaced++;
        }
    }

    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (board[i].isBomb) continue;
        let count = 0;
        let row = Math.floor(i / GRID_SIZE);
        let col = i % GRID_SIZE;

        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue;
                let newRow = row + r;
                let newCol = col + c;
                if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
                    let neighborIndex = newRow * GRID_SIZE + newCol;
                    if (board[neighborIndex].isBomb) {
                        count++;
                    }
                }
            }
        }
        board[i].neighborBombs = count;
    }

    for (let i = 0; i < TOTAL_CELLS; i++) {
        const cell = document.createElement("div");
        cell.id = i.toString();
        cell.className = "grid-item valid";
        cell.setAttribute("data", board[i].neighborBombs);

        cell.addEventListener("click", () => {
            if (isGameOver || board[i].isRevealed || board[i].isFlagged) return;
            revealCell(i);
        });

        cell.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            if (isGameOver || board[i].isRevealed) return;
            toggleFlag(i);
        });

        if (gridContainer) {
            gridContainer.appendChild(cell);
        }
    }

    updateFlagsLeft();
}

function revealCell(index) {
    if (isGameOver || board[index].isRevealed || board[index].isFlagged) return;

    board[index].isRevealed = true;
    const cellElement = document.getElementById(index.toString());
    if (!cellElement) return;
    
    cellElement.classList.add("checked");

    if (board[index].isBomb) {
        cellElement.classList.add("bomb");
        cellElement.innerHTML = "💣";
        endGame(false);
        return;
    }

    cellElement.innerHTML = board[index].neighborBombs;
    revealedCount++;
    checkWin();
}

function toggleFlag(index) {
    const cellElement = document.getElementById(index.toString());
    if (!cellElement) return;
    
    if (board[index].isFlagged) {
        board[index].isFlagged = false;
        cellElement.classList.remove("flag");
        cellElement.innerHTML = "";
        flagCount--;
    } else {
        board[index].isFlagged = true;
        cellElement.classList.add("flag");
        cellElement.innerHTML = "🚩";
        flagCount++;
    }
    updateFlagsLeft();
}

function updateFlagsLeft() {
    let flagsLeftSpan = document.getElementById("flagsLeft");
    if (flagsLeftSpan) {
        flagsLeftSpan.innerText = TOTAL_BOMBS - flagCount;
    }
}

function checkWin() {
    if (revealedCount === TOTAL_CELLS - TOTAL_BOMBS) {
        endGame(true);
    }
}

function endGame(isWin) {
    isGameOver = true;
    
    for (let i = 0; i < TOTAL_CELLS; i++) {
        if (board[i].isBomb) {
            const cellElement = document.getElementById(i.toString());
            if (cellElement) {
                cellElement.classList.add("checked", "bomb");
                cellElement.innerHTML = "💣";
            }
        }
    }

    let resultDiv = document.getElementById("result");
    if (resultDiv) {
        resultDiv.innerText = isWin ? "YOU WIN!" : "YOU LOSE!";
    }
}