let board = [];
let selected = null;
let time = 0;

let timerInterval;

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/board')
        .then(response => response.json())
        .then(data => {
            board = data;
            drawGrid();
            startTimer();
        });

    document.getElementById('solve-btn').addEventListener('click', solveBoard);
    document.getElementById('clear-btn').addEventListener('click', clearBoard);
});

let misses = 0; // Counter for misses

// Function to draw the grid
function drawGrid() {
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = ''; // Clear existing cells

    for (let row = 0; row < 9; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');

        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            // Set text content for original numbers
            if (board[row][col] !== 0) {
                cell.textContent = board[row][col];
                cell.classList.add('fixed'); // Add class to indicate fixed cells
            } else {
                cell.contentEditable = true; // Allow editing for empty cells
                cell.addEventListener('blur', (event) => {
                    const num = parseInt(event.target.textContent);
                    if (isNaN(num) || num < 1 || num > 9) {
                        event.target.textContent = ''; // Clear invalid input
                    } else {
                        // Check if the number is correct
                        if (!isValid(row, col, num)) {
                            misses++; // Increment misses for wrong numbers
                            document.getElementById('misses-counter').textContent = misses;
                            event.target.classList.add('wrong'); // Highlight wrong input
                        } else {
                            event.target.classList.remove('wrong'); // Remove wrong class if valid
                            if (isBoardComplete()) {
                                alert("Congratulations! You've completed the Sudoku!");
                            }}
                    }
                });
            }

            cell.dataset.row = row;
            cell.dataset.col = col;
            rowDiv.appendChild(cell);
        }

        grid.appendChild(rowDiv);
    }
}
function selectCell(row, col) {
    if (selected) {
        const prevCell = document.querySelector(`.cell.selected`);
        if (prevCell) prevCell.classList.remove('selected');
    }

    selected = { row, col };
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('selected');
}

function startTimer() {
    timerInterval = setInterval(() => {
        time++;
        document.getElementById('time').textContent = `Time: ${Math.floor(time / 60)}:${time % 60}`;
    }, 1000);
}

document.addEventListener('keydown', (event) => {
    if (selected ) {
        const { row, col } = selected;
        const number = parseInt(event.key);
        
        // Check if the key pressed is a number between 1 and 9
        if (number >= 1 && number <= 9) {
            board[row][col] = number; // Place the number in the board
            drawGrid(); // Redraw the grid
        }
        
        // Handle delete key to clear the cell
        if (event.key === 'Backspace' || event.key === 'Delete') {
            board[row][col] = 0; // Clear the cell
            drawGrid(); // Redraw the grid
        }
    }
});


function solveBoard() {
    clearInterval(timerInterval); //
    if (solve(board)) {
        drawGrid();
    } else {
        alert("No solution exists!");
    }
}



// Backtracking algorithm to solve the Sudoku

function solve(board) {
    let emptySpot = findEmpty(board);
    if (!emptySpot) {
        return true; // Solved
    }
    const [row, col] = emptySpot;

    for (let num = 1; num <= 9; num++) {
        if (isValid(row,col,num)) {
            board[row][col] = num;

            if (solve(board)) {
                return true;
            }

            board[row][col] = 0; // Reset if not valid
        }
    }
    return false; // Trigger backtracking
}

// Find an empty spot in the board
function findEmpty(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null; // No empty spots
}

// Check if placing a number is valid
function isValid(row, col, num) {
    // Check the row
    for (let c = 0; c < 9; c++) {
        if (c !== col && board[row][c] === num) {
            return false;
        }
    }

    // Check the column
    for (let r = 0; r < 9; r++) {
        if (r !== row && board[r][col] === num) {
            return false;
        }
    }

    // Check the 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if ((r !== row || c !== col) && board[r][c] === num) {
                return false;
            }
        }
    }

    return true; // Valid number
}


function clearBoard() {

    misses = 0; // Reset misses
    time = 0; // Reset time
    document.getElementById('misses-counter').textContent = misses;
    document.getElementById('time').textContent = 'Time: 0:0';
    drawGrid(); // Redraw the grid
    
}

// Function to check if the board is complete
function isBoardComplete() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0 || !isValid(row, col, board[row][col])) {
                return false; // Board is not complete
            }
        }
    }
    return true; // Board is complete and valid
}