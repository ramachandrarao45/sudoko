let numSelected = null;
let errors = 0;
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

    let tempGrid = Array(9).fill(0).map(() => Array(9).fill(0));
    solveSudoku(tempGrid);
    solution = tempGrid.map(row => [...row]);

    board = solution.map(row => [...row]);
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

    const boardDiv = document.getElementById("board");
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r + "-" + c;
            tile.classList.add("tile");
            if (r === 2 || r === 5) tile.classList.add("horizontal-line");
            if (c === 2 || c === 5) tile.classList.add("vertical-line");
            tile.addEventListener("click", handleTileClick);
            boardDiv.appendChild(tile);
        }
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

function handleTileClick() {
    if (!numSelected) return;
    let coords = this.id.split("-");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    if (initialBoard[r][c] !== 0) return;

    let chosenVal = parseInt(numSelected.innerText);

    moveHistory.push({
        r: r,
        c: c,
        prevVal: board[r][c],
        prevErrors: errors
    });

    if (chosenVal !== solution[r][c]) {
        errors++;
        document.getElementById("errors").innerText = errors;
    }
    
    board[r][c] = chosenVal;
    renderBoard();
}

function undo() {
    if (moveHistory.length === 0) return;
    let lastMove = moveHistory.pop();
    board[lastMove.r][lastMove.c] = lastMove.prevVal;
    errors = lastMove.prevErrors;
    document.getElementById("errors").innerText = errors;
    renderBoard();
}

function renderBoard() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.getElementById(r + "-" + c);
            let val = board[r][c];
            tile.innerText = val === 0 ? "" : val;
            
            tile.classList.remove("tile-start");
            tile.style.backgroundColor = "white";
            
            if (initialBoard[r][c] !== 0) {
                tile.classList.add("tile-start");
            } else if (val !== 0) {
                if (val === solution[r][c]) {
                    tile.style.color = "#2e7d32";
                } else {
                    tile.style.color = "#d32f2f";
                    tile.style.backgroundColor = "#ffebee";
                }
            }
        }
    }
}

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