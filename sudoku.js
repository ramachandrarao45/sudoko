let numSelected = null;
let errors = 0;
let wins = 0; // New variable for successful games
let board = [];      
let solution = [];   
let initialBoard = []; 
let moveHistory = [];

window.onload = function() {
    setupUI();
    generateGame();
};

function generateGame() {
    errors = 0;
    moveHistory = [];
    document.getElementById("errors").innerText = errors;
    document.getElementById("board").innerHTML = ""; // Clear board for new game

    let tempGrid = Array(9).fill(0).map(() => Array(9).fill(0));
    solveSudoku(tempGrid);
    solution = tempGrid.map(row => [...row]);

    board = solution.map(row => [...row]);
    
    // FOR TESTING: Change 45 to 2 to see the "Win" counter work quickly!
    let removed = 45; 
    while (removed > 0) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (board[r][c] !== 0) {
            board[r][c] = 0;
            removed--;
        }
    }

    initialBoard = board.map(row => [...row]);
    renderBoard();
}

function setupUI() {
    // This connects the logic to your HTML elements
    const digitsDiv = document.getElementById("digits");
    for (let i = 1; i <= 9; i++) {
        let num = document.createElement("div");
        num.id = "n-" + i;
        num.innerText = i;
        num.classList.add("number");
        num.addEventListener("click", function() {
            if (numSelected) numSelected.classList.remove("number-selected");
            numSelected = this;
            numSelected.classList.add("number-selected");
        });
        digitsDiv.appendChild(num);
    }

    const panel = document.getElementById("panel");
    const undoBtn = document.createElement("button");
    undoBtn.innerText = "Undo Last Move";
    undoBtn.className = "undo-btn";
    undoBtn.onclick = undo;

    const newBtn = document.createElement("button");
    newBtn.innerText = "New Game";
    newBtn.onclick = generateGame;

    panel.appendChild(undoBtn);
    panel.appendChild(newBtn);
}

function renderBoard() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = ""; // Refresh the board

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r + "-" + c;
            tile.classList.add("tile");
            
            let val = board[r][c];
            tile.innerText = val === 0 ? "" : val;

            if (r === 2 || r === 5) tile.classList.add("horizontal-line");
            if (c === 2 || c === 5) tile.classList.add("vertical-line");

            if (initialBoard[r][c] !== 0) {
                tile.classList.add("tile-start");
            } else {
                tile.addEventListener("click", handleTileClick);
                if (val !== 0) {
                    if (val === solution[r][c]) {
                        tile.style.color = "#2e7d32";
                    } else {
                        tile.style.color = "#d32f2f";
                        tile.style.backgroundColor = "#ffebee";
                    }
                }
            }
            boardDiv.appendChild(tile);
        }
    }
}

function handleTileClick() {
    if (!numSelected) return;
    let coords = this.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    let chosenVal = parseInt(numSelected.innerText);

    moveHistory.push({
        r: r, c: c,
        prevVal: board[r][c],
        prevErrors: errors
    });

    if (chosenVal !== solution[r][c]) {
        errors++;
        document.getElementById("errors").innerText = errors;
    }
    
    board[r][c] = chosenVal;
    renderBoard();
    checkWin(); // Trigger win check after every move
}

function checkWin() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] !== solution[r][c]) return;
        }
    }
    wins++;
    document.getElementById("wins").innerText = wins;
    alert("Perfect! You've won this round!");
}

// --- SOLVER UTILS ---
function solveSudoku(grid) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0) {
                let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                for (let n of nums) {
                    if (isSafe(grid, r, c, n)) {
                        grid[r][c] = n;
                        if (solveSudoku(grid)) return true;
                        grid[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isSafe(grid, r, c, n) {
    for (let i = 0; i < 9; i++) {
        if (grid[r][i] === n || grid[i][c] === n) return false;
    }
    let sR = r - r % 3, sC = c - c % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[sR+i][sC+j] === n) return false;
        }
    }
    return true;
}

function undo() {
    if (moveHistory.length === 0) return;
    let lastMove = moveHistory.pop();
    board[lastMove.r][lastMove.c] = lastMove.prevVal;
    errors = lastMove.prevErrors;
    document.getElementById("errors").innerText = errors;
    renderBoard();
}