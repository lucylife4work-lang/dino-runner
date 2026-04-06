// ============================================================
// player.js — Player characters (Dino, Ninja, Astronaut)
// ============================================================

// ── Pixel art sprite definitions ────────────────────────────
// Each frame is a 2D array; palette maps numbers → hex colours.

const CHARACTER_DATA = {
    dino: {
        palette: { 1: '#535353', 2: '#333333', 3: '#757575', 4: '#ffffff' },
        run: [
            // Frame 1 — right leg forward
            [
                [0,0,0,0,1,1,1,1,1],
                [0,0,0,1,1,4,1,1,1],
                [0,0,0,1,1,1,1,1,1],
                [0,0,0,1,1,1,1,0,0],
                [1,0,1,1,1,1,0,0,0],
                [1,1,1,1,1,1,1,0,0],
                [1,1,1,1,1,1,0,0,0],
                [0,1,1,1,1,1,0,0,0],
                [0,0,1,1,1,0,0,0,0],
                [0,0,1,0,0,1,0,0,0],
                [0,0,1,0,0,0,0,0,0],
            ],
            // Frame 2 — left leg forward
            [
                [0,0,0,0,1,1,1,1,1],
                [0,0,0,1,1,4,1,1,1],
                [0,0,0,1,1,1,1,1,1],
                [0,0,0,1,1,1,1,0,0],
                [1,0,1,1,1,1,0,0,0],
                [1,1,1,1,1,1,1,0,0],
                [1,1,1,1,1,1,0,0,0],
                [0,1,1,1,1,1,0,0,0],
                [0,0,1,1,1,0,0,0,0],
                [0,0,0,1,0,1,0,0,0],
                [0,0,0,0,0,1,0,0,0],
            ],
        ],
        duck: [
            [
                [0,0,0,0,0,0,1,1,1,1,1],
                [0,0,0,0,0,1,1,4,1,1,1],
                [1,0,0,0,0,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,1,0,0,0],
                [0,0,1,1,1,1,0,0,0,0,0],
                [0,0,1,0,0,1,0,0,0,0,0],
            ],
            [
                [0,0,0,0,0,0,1,1,1,1,1],
                [0,0,0,0,0,1,1,4,1,1,1],
                [1,0,0,0,0,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,1,0,0,0],
                [0,0,1,1,1,1,0,0,0,0,0],
                [0,0,0,1,0,1,0,0,0,0,0],
            ],
        ],
    },

    ninja: {
        palette: { 1: '#1a1a2e', 2: '#e94560', 3: '#0f3460', 4: '#ffffff', 5: '#e94560' },
        run: [
            [
                [0,0,0,1,1,1,1,0],
                [0,0,1,1,4,4,1,0],
                [0,0,1,2,2,2,2,5],
                [0,0,0,1,1,1,0,0],
                [0,0,1,1,1,1,0,0],
                [0,1,3,1,1,3,0,0],
                [0,1,3,1,1,3,0,0],
                [0,0,1,1,1,1,0,0],
                [0,0,1,0,0,1,0,0],
                [0,0,1,0,0,0,0,0],
            ],
            [
                [0,0,0,1,1,1,1,0],
                [0,0,1,1,4,4,1,0],
                [0,0,1,2,2,2,2,5],
                [0,0,0,1,1,1,0,0],
                [0,0,1,1,1,1,0,0],
                [0,1,3,1,1,3,0,0],
                [0,1,3,1,1,3,0,0],
                [0,0,1,1,1,1,0,0],
                [0,0,0,1,0,1,0,0],
                [0,0,0,0,0,1,0,0],
            ],
        ],
        duck: [
            [
                [0,0,0,0,1,1,1,1,0,0],
                [0,0,0,1,1,4,4,1,0,0],
                [0,0,0,1,2,2,2,2,5,5],
                [0,1,1,1,1,1,1,0,0,0],
                [1,3,1,1,1,1,3,0,0,0],
                [0,0,1,0,0,1,0,0,0,0],
            ],
            [
                [0,0,0,0,1,1,1,1,0,0],
                [0,0,0,1,1,4,4,1,0,0],
                [0,0,0,1,2,2,2,2,5,5],
                [0,1,1,1,1,1,1,0,0,0],
                [1,3,1,1,1,1,3,0,0,0],
                [0,0,0,1,0,1,0,0,0,0],
            ],
        ],
    },

    astronaut: {
        palette: { 1: '#e0e0e0', 2: '#87ceeb', 3: '#b0b0b0', 4: '#40e0d0', 5: '#ff6b6b' },
        run: [
            [
                [0,0,3,3,3,3,3,0],
                [0,3,2,2,2,2,3,0],
                [0,3,2,4,2,4,3,0],
                [0,3,2,2,2,2,3,0],
                [0,0,3,3,3,3,0,0],
                [0,1,1,1,1,1,1,0],
                [5,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,0,0],
                [0,0,1,0,0,1,0,0],
                [0,0,1,0,0,0,0,0],
            ],
            [
                [0,0,3,3,3,3,3,0],
                [0,3,2,2,2,2,3,0],
                [0,3,2,4,2,4,3,0],
                [0,3,2,2,2,2,3,0],
                [0,0,3,3,3,3,0,0],
                [0,1,1,1,1,1,1,0],
                [5,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,0,0],
                [0,0,0,1,0,1,0,0],
                [0,0,0,0,0,1,0,0],
            ],
        ],
        duck: [
            [
                [0,0,0,3,3,3,3,3,0],
                [0,0,3,2,2,2,2,3,0],
                [0,0,3,2,4,2,4,3,0],
                [5,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,0,0],
                [0,0,1,0,0,1,0,0,0],
            ],
            [
                [0,0,0,3,3,3,3,3,0],
                [0,0,3,2,2,2,2,3,0],
                [0,0,3,2,4,2,4,3,0],
                [5,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,0,0],
                [0,0,0,1,0,1,0,0,0],
            ],
        ],
    },
};

// ── Player class ────────────────────────────────────────────

class Player {
    constructor(groundY) {
        this.groundY = groundY;
        this.characterId = 'dino';
        this.cellSize = 4;

        // Position (will be set by reset())
        this.x = 50;
        this.y = 0;
        this.vy = 0;

        // State
        this.isJumping = false;
        this.isDucking = false;
        this.frameIndex = 0;
        this.frameTick = 0;
        this.frameInterval = 8;     // ticks per frame

        this.reset();
    }

    setCharacter(id) {
        this.characterId = id;
        this.reset();
    }

    reset() {
        const data = CHARACTER_DATA[this.characterId];
        const frame = data.run[0];
        this.w = frame[0].length * this.cellSize;
        this.h = frame.length * this.cellSize;
        this.y = this.groundY - this.h;
        this.vy = 0;
        this.isJumping = false;
        this.isDucking = false;
        this.frameIndex = 0;
    }

    jump() {
        if (this.isJumping) return false;
        this.vy = -11;
        this.isJumping = true;
        this.isDucking = false;
        return true;
    }

    duck(active) {
        if (this.isJumping) {
            // Fast fall when ducking in air
            if (active && this.vy < 8) this.vy += 2;
            return;
        }
        this.isDucking = active;
        const data = CHARACTER_DATA[this.characterId];
        if (active) {
            const frame = data.duck[0];
            this.w = frame[0].length * this.cellSize;
            this.h = frame.length * this.cellSize;
        } else {
            const frame = data.run[0];
            this.w = frame[0].length * this.cellSize;
            this.h = frame.length * this.cellSize;
        }
        this.y = this.groundY - this.h;
    }

    update() {
        // Gravity
        if (this.isJumping) {
            this.vy += GAME_CONFIG.GRAVITY;
            this.y += this.vy;
            const floorY = this.groundY - this.h;
            if (this.y >= floorY) {
                this.y = floorY;
                this.vy = 0;
                this.isJumping = false;
            }
        }

        // Animation frame
        this.frameTick++;
        if (this.frameTick >= this.frameInterval) {
            this.frameTick = 0;
            this.frameIndex = 1 - this.frameIndex;   // toggle 0/1
        }
    }

    draw(ctx, isNight) {
        const data = CHARACTER_DATA[this.characterId];
        const frames = this.isDucking ? data.duck : data.run;
        const frame = frames[this.frameIndex];
        // Outline colour adapts to background for contrast
        const outline = isNight ? '#e0e0e0' : '#222222';
        drawPixelArt(ctx, frame, this.cellSize, this.x, this.y, data.palette, outline);
    }

    // Hitbox (slightly smaller than visual for fairness)
    get hitbox() {
        const shrink = 4;
        return {
            x: this.x + shrink,
            y: this.y + shrink,
            w: this.w - shrink * 2,
            h: this.h - shrink * 2,
        };
    }
}

// ── Draw character preview on small canvases ────────────────

function drawCharacterPreview(canvas, charId) {
    const ctx = canvas.getContext('2d');
    const data = CHARACTER_DATA[charId];
    const frame = data.run[0];
    const cell = 5;
    const totalW = frame[0].length * cell;
    const totalH = frame.length * cell;
    const ox = (canvas.width - totalW) / 2;
    const oy = (canvas.height - totalH) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPixelArt(ctx, frame, cell, ox, oy, data.palette, '#222222');
}
