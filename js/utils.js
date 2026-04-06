// ============================================================
// utils.js — Shared constants & helper functions
// ============================================================

const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 300,
    GROUND_Y: 250,
    GRAVITY: 0.75,
    INITIAL_SPEED: 10,
    MAX_SPEED: 30,
    SPEED_INCREMENT: 0.003,
    DAY_NIGHT_INTERVAL: 700,       // score interval for toggling
    MIN_OBSTACLE_GAP: 80,          // min frames between obstacles
    OBSTACLE_SPAWN_RATE: 0.02,
    LEADERBOARD_MAX: 10,
};

// Pixel-art helper — draw a grid of coloured cells
// outline: optional colour string to draw a 1-cell border around filled pixels
function drawPixelArt(ctx, grid, cellSize, offsetX, offsetY, palette, outline) {
    const rows = grid.length;
    const cols = grid[0].length;

    // Pass 1: draw outline (expanded border around filled pixels)
    if (outline) {
        ctx.fillStyle = outline;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 0) continue;
                // Check 4 neighbours — draw outline cell where neighbour is empty or out of bounds
                for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
                    const nr = r + dr, nc = c + dc;
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === 0) {
                        ctx.fillRect(
                            offsetX + (c + dc) * cellSize,
                            offsetY + (r + dr) * cellSize,
                            cellSize,
                            cellSize,
                        );
                    }
                }
            }
        }
    }

    // Pass 2: draw filled pixels on top
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const colorKey = grid[r][c];
            if (colorKey === 0) continue;
            ctx.fillStyle = palette[colorKey] || '#ff00ff';
            ctx.fillRect(
                offsetX + c * cellSize,
                offsetY + r * cellSize,
                cellSize,
                cellSize,
            );
        }
    }
}

// Format score to 5-digit string
function formatScore(n) {
    return String(Math.floor(n)).padStart(5, '0');
}

// Random integer in [min, max]
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simple AABB collision
function collides(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

// Leaderboard helpers (localStorage)
function getLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem('dino_leaderboard')) || [];
    } catch {
        return [];
    }
}

function saveLeaderboard(board) {
    localStorage.setItem('dino_leaderboard', JSON.stringify(board));
}

function addToLeaderboard(name, score) {
    const board = getLeaderboard();
    board.push({ name, score, date: new Date().toLocaleDateString() });
    board.sort((a, b) => b.score - a.score);
    const trimmed = board.slice(0, GAME_CONFIG.LEADERBOARD_MAX);
    saveLeaderboard(trimmed);
    return trimmed;
}

function isHighScore(score) {
    const board = getLeaderboard();
    if (board.length < GAME_CONFIG.LEADERBOARD_MAX) return true;
    return score > board[board.length - 1].score;
}
