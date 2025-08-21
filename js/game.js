// Simple Snake Game with Optimized Speed
class SnakeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gameSpeed = 150; // Slower speed for better playability (was probably much faster)
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupEventListeners();
        this.generateFood();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) {
                if (e.key === ' ' || e.key === 'Enter') {
                    this.startGame();
                }
                return;
            }
            
            // Prevent default arrow key behavior
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            
            // Change direction
            switch (e.key) {
                case 'ArrowUp':
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (this.dx === 0) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (this.dx === 0) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case ' ':
                case 'Escape':
                    this.pauseGame();
                    break;
            }
        });
        
        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.gameRunning) {
                this.startGame();
                return;
            }
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 30 && this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                } else if (deltaX < -30 && this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
            } else {
                // Vertical swipe
                if (deltaY > 30 && this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                } else if (deltaY < -30 && this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.generateFood();
        this.updateScore();
    }
    
    pauseGame() {
        this.gameRunning = !this.gameRunning;
    }
    
    gameLoop() {
        setTimeout(() => {
            if (this.gameRunning) {
                this.update();
                this.draw();
            } else {
                this.drawStartScreen();
            }
            this.gameLoop();
        }, this.gameSpeed);
    }
    
    update() {
        // Move snake head
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
            
            // Slightly increase speed (but keep it reasonable)
            if (this.gameSpeed > 100) {
                this.gameSpeed -= 2;
            }
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'var(--background)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.ctx.fillStyle = '#D4AF37';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // Draw snake head differently
            if (i === 0) {
                this.ctx.fillStyle = '#f4d03f';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 3,
                    segment.y * this.gridSize + 3,
                    this.gridSize - 6,
                    this.gridSize - 6
                );
                this.ctx.fillStyle = '#D4AF37';
            }
        }
        
        // Draw food
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
        
        // Draw grid (optional)
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawStartScreen() {
        this.ctx.fillStyle = 'var(--background)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'var(--text)';
        this.ctx.font = '24px Montserrat';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Snake Game', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '16px Poppins';
        this.ctx.fillText('Press SPACE or tap to start', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Use arrow keys or swipe to move', this.canvas.width / 2, this.canvas.height / 2 + 30);
        
        if (this.score > 0) {
            this.ctx.fillText(`Last Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gameSpeed = 150; // Reset speed
        
        // Show game over message
        setTimeout(() => {
            if (window.portfolioUtils) {
                window.portfolioUtils.showNotification(`Game Over! Score: ${this.score}`, 'info');
            }
        }, 100);
    }
    
    updateScore() {
        const scoreElement = document.getElementById('gameScore');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
}

// Tic Tac Toe Game
class TicTacToeGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'human'; // 'human' or 'ai'
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.createBoard();
        this.createControls();
    }
    
    createBoard() {
        const boardElement = document.createElement('div');
        boardElement.className = 'tic-tac-toe-board';
        boardElement.innerHTML = `
            <div class="game-info">
                <h3>Tic Tac Toe</h3>
                <p class="current-player">Player: <span id="currentPlayer">X</span></p>
                <p class="game-status" id="gameStatus">Your turn!</p>
            </div>
            <div class="board-grid">
                ${Array(9).fill('').map((_, i) => `<button class="board-cell" data-index="${i}"></button>`).join('')}
            </div>
            <div class="game-controls">
                <button class="btn btn-outline" onclick="this.resetGame()">New Game</button>
                <button class="btn btn-outline" onclick="this.toggleGameMode()">vs AI</button>
            </div>
        `;
        
        this.container.appendChild(boardElement);
        this.setupEventListeners();
    }
    
    createControls() {
        // Add CSS for the game
        const style = document.createElement('style');
        style.textContent = `
            .tic-tac-toe-board {
                max-width: 300px;
                margin: 0 auto;
                text-align: center;
            }
            
            .board-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 5px;
                margin: 20px 0;
                background: var(--primary);
                padding: 5px;
                border-radius: 10px;
            }
            
            .board-cell {
                aspect-ratio: 1;
                background: var(--card-bg);
                border: none;
                border-radius: 5px;
                font-size: 2rem;
                font-weight: bold;
                color: var(--text);
                cursor: pointer;
                transition: var(--transition);
            }
            
            .board-cell:hover {
                background: var(--background);
                transform: scale(0.95);
            }
            
            .board-cell:disabled {
                cursor: not-allowed;
                opacity: 0.7;
            }
            
            .game-controls {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 20px;
            }
            
            .game-controls .btn {
                padding: 8px 16px;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        const cells = this.container.querySelectorAll('.board-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
    }
    
    handleCellClick(e) {
        const index = parseInt(e.target.dataset.index);
        
        if (this.board[index] !== '' || !this.gameActive) return;
        
        this.makeMove(index, this.currentPlayer);
        
        if (this.gameActive && this.gameMode === 'ai' && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        const cell = this.container.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.disabled = true;
        
        if (this.checkWinner()) {
            this.gameActive = false;
            this.updateStatus(`Player ${player} wins!`);
            return;
        }
        
        if (this.board.every(cell => cell !== '')) {
            this.gameActive = false;
            this.updateStatus("It's a tie!");
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateCurrentPlayer();
        this.updateStatus(`Player ${this.currentPlayer}'s turn`);
    }
    
    makeAIMove() {
        const availableMoves = this.board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        
        if (availableMoves.length === 0) return;
        
        // Simple AI: random move (can be enhanced)
        const randomIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        this.makeMove(randomIndex, 'O');
    }
    
    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
        });
    }
    
    updateCurrentPlayer() {
        const playerElement = this.container.querySelector('#currentPlayer');
        if (playerElement) {
            playerElement.textContent = this.currentPlayer;
        }
    }
    
    updateStatus(message) {
        const statusElement = this.container.querySelector('#gameStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        const cells = this.container.querySelectorAll('.board-cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.disabled = false;
        });
        
        this.updateCurrentPlayer();
        this.updateStatus('Your turn!');
    }
    
    toggleGameMode() {
        this.gameMode = this.gameMode === 'human' ? 'ai' : 'human';
        const button = this.container.querySelector('.game-controls .btn:last-child');
        button.textContent = this.gameMode === 'ai' ? 'vs Human' : 'vs AI';
        this.resetGame();
    }
}

// Initialize games when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Snake Game if canvas exists
    if (document.getElementById('snakeGame')) {
        new SnakeGame('snakeGame');
    }
    
    // Initialize Tic Tac Toe if container exists
    if (document.getElementById('ticTacToe')) {
        new TicTacToeGame('ticTacToe');
    }
});

